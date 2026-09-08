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

  // Recover original URL path and preserve query string if rewritten by Vercel
  const matched = req.headers["x-matched-path"] || "";
  const queryIndex = req.url ? req.url.indexOf("?") : -1;
  const queryString = queryIndex !== -1 ? req.url.slice(queryIndex) : "";
  const rawPath = queryIndex !== -1 ? req.url.slice(0, queryIndex) : (req.url || "");

  if (matched && matched.startsWith("/api")) {
    req.url = matched + queryString;
  } else if (rawPath === "/api/index.js" || rawPath.startsWith("/api/index.js")) {
    const fixedPath = rawPath.replace(/^\/api\/index\.js\/?/, "/api/");
    req.url = fixedPath + queryString;
  } else if (rawPath && !rawPath.startsWith("/api")) {
    req.url = "/api" + (rawPath.startsWith("/") ? rawPath : "/" + rawPath) + queryString;
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
