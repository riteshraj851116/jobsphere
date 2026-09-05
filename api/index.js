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
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    res.writeHead(204, {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET,POST,PUT,PATCH,DELETE,OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type,Authorization"
    });
    return res.end();
  }

  // Recover original URL path if rewritten by Vercel
  const matched = req.headers["x-matched-path"] || "";
  if (matched && matched.startsWith("/api")) {
    req.url = matched;
  } else if (req.url === "/api/index.js" || req.url.startsWith("/api/index.js")) {
    req.url = req.url.replace(/^\/api\/index\.js\/?/, "/api/");
  } else if (req.url && !req.url.startsWith("/api")) {
    req.url = "/api" + (req.url.startsWith("/") ? req.url : "/" + req.url);
  }

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
    app(req, res, () => {
      resolve();
    });
    res.on("finish", resolve);
    res.on("close", resolve);
  });
};
