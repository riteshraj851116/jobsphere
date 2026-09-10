const path = require("path");

try {
  require("dotenv").config({ path: path.join(__dirname, "../backend/.env") });
  require("dotenv").config({ path: path.join(__dirname, ".env") });
  require("dotenv").config();
} catch (e) {
  // Dotenv is optional in serverless
}

let app = null;
let loadError = null;

try {
  app = require("../backend/Server");
} catch (err) {
  console.error("Vercel backend module load error:", err);
  loadError = {
    message: err?.message || String(err),
    stack: err?.stack || null
  };
}

module.exports = async (req, res) => {
  const reqOrigin = req.headers.origin || "*";

  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    res.writeHead(204, {
      "Access-Control-Allow-Origin": reqOrigin,
      "Access-Control-Allow-Credentials": "true",
      "Access-Control-Allow-Methods": "GET,POST,PUT,PATCH,DELETE,OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type,Authorization,X-Requested-With,Accept"
    });
    return res.end();
  }

  // Extract original requested API URL cleanly for Express routing
  let targetUrl = req.url || "/api";
  const forwardedUri = req.headers["x-forwarded-uri"] || req.headers["x-original-uri"];
  
  if (forwardedUri && forwardedUri.startsWith("/api")) {
    targetUrl = forwardedUri;
  } else if (req.url && req.url.startsWith("/api") && !req.url.includes("index.js")) {
    targetUrl = req.url;
  } else {
    const matched = req.headers["x-matched-path"] || "";
    if (matched && matched.startsWith("/api") && !matched.includes("index.js")) {
      const queryIndex = req.url ? req.url.indexOf("?") : -1;
      const queryString = queryIndex !== -1 ? req.url.slice(queryIndex) : "";
      targetUrl = matched + queryString;
    }
  }

  // Normalize path removing /api/index.js artifact
  targetUrl = targetUrl.replace(/\/api\/index\.js\/?/, "/api/");
  if (!targetUrl.startsWith("/api")) {
    targetUrl = "/api" + (targetUrl.startsWith("/") ? targetUrl : "/" + targetUrl);
  }

  req.url = targetUrl;

  // If backend failed to load, respond with diagnostic error JSON
  if (loadError) {
    res.writeHead(500, {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*"
    });
    return res.end(
      JSON.stringify({
        success: false,
        message: "Serverless backend initialization failure",
        error: loadError.message,
        stack: loadError.stack
      })
    );
  }

  // Ensure DB connected
  try {
    const connectDB = require("../backend/config/db");
    await connectDB();
  } catch (dbErr) {
    console.warn("Vercel DB connection non-fatal warning:", dbErr?.message);
  }

  return new Promise((resolve) => {
    try {
      app(req, res, (err) => {
        if (err && !res.headersSent) {
          res.writeHead(500, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ success: false, message: err.message || "Internal server error" }));
        }
        resolve();
      });
    } catch (err) {
      console.error("Serverless app invocation exception:", err);
      if (!res.headersSent) {
        res.writeHead(500, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ success: false, message: err.message || "Unhandled server exception" }));
      }
      resolve();
    }
    res.on("finish", resolve);
    res.on("close", resolve);
    res.on("error", resolve);
  });
};
