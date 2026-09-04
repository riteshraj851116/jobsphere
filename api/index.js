let app = null;
let initError = null;

try {
  try {
    const path = require("path");
    require("dotenv").config();
    require("dotenv").config({ path: path.join(__dirname, "../backend/.env") });
  } catch (e) {
    // Dotenv is optional in serverless
  }

  app = require("../backend/Server");
} catch (err) {
  console.error("Vercel Serverless module load error:", err);
  initError = {
    message: err?.message || String(err),
    stack: err?.stack || null
  };
}

const sendJson = (res, statusCode, data) => {
  if (typeof res.status === "function" && typeof res.json === "function") {
    return res.status(statusCode).json(data);
  }
  try {
    res.writeHead(statusCode, {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET,POST,PUT,PATCH,DELETE,OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type,Authorization"
    });
    res.end(JSON.stringify(data));
  } catch (e) {
    console.error("sendJson error:", e);
  }
};

module.exports = (req, res) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    if (typeof res.status === "function" && typeof res.send === "function") {
      return res.status(204).send();
    }
    try {
      res.writeHead(204, {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET,POST,PUT,PATCH,DELETE,OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type,Authorization"
      });
      return res.end();
    } catch (e) {
      return res.end();
    }
  }

  // Diagnostic health endpoint
  const url = req.url || "";
  if (url === "/api/health" || url === "/health" || url === "/api" || url === "/") {
    return sendJson(res, 200, {
      success: true,
      message: "JobSphere Vercel Serverless API is running",
      hasApp: Boolean(app),
      initError: initError,
      timestamp: new Date().toISOString()
    });
  }

  if (initError) {
    return sendJson(res, 500, {
      success: false,
      message: "Serverless backend initialization error",
      error: initError.message,
      stack: initError.stack
    });
  }

  if (app) {
    if (req.url && !req.url.startsWith("/api")) {
      req.url = "/api" + (req.url.startsWith("/") ? req.url : "/" + req.url);
    }
    return app(req, res);
  }

  return sendJson(res, 500, {
    success: false,
    message: "Serverless backend application instance unavailable"
  });
};
