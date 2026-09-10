const path = require("path");

try {
  require("dotenv").config({ path: path.join(__dirname, "../backend/.env") });
  require("dotenv").config({ path: path.join(__dirname, ".env") });
  require("dotenv").config();
} catch (_e) {
  // Dotenv loading is optional in Vercel serverless environments
}

let app = null;
let loadError = null;

try {
  app = require("../backend/Server");
} catch (err) {
  console.error("Vercel backend module initialization error:", err);
  loadError = {
    message: err?.message || String(err),
    stack: err?.stack || null
  };
}

/**
 * Main Vercel serverless function entrypoint.
 * Proxies incoming HTTP requests into the Express application instance.
 */
const handler = async (req, res) => {
  const reqOrigin = req.headers.origin || "*";

  // Handle CORS preflight options immediately
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

  // 1. Check for rewrite query parameter passed by vercel.json
  try {
    const parsedUrl = new URL(req.url, "http://localhost");
    const capturedPath = parsedUrl.searchParams.get("_url_path");
    if (capturedPath !== null) {
      parsedUrl.searchParams.delete("_url_path");
      const cleanQuery = parsedUrl.searchParams.toString();
      targetUrl = "/api" + (capturedPath ? "/" + capturedPath.replace(/^\//, "") : "") + (cleanQuery ? "?" + cleanQuery : "");
    } else {
      // 2. Check standard proxy headers
      const forwardedUri = req.headers["x-forwarded-uri"] || req.headers["x-original-uri"];
      const matchedPath = req.headers["x-vercel-matched-path"] || req.headers["x-matched-path"] || "";

      if (forwardedUri && forwardedUri.startsWith("/api")) {
        targetUrl = forwardedUri;
      } else if (matchedPath && matchedPath.startsWith("/api") && !matchedPath.includes("index.js")) {
        const queryIndex = req.url.indexOf("?");
        const queryString = queryIndex !== -1 ? req.url.slice(queryIndex) : "";
        targetUrl = matchedPath + queryString;
      }
    }
  } catch (_urlErr) {
    // Fallback URL normalizer
    targetUrl = req.url || "/api";
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

  // Ensure DB connection is established for this lambda invocation
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

// Disable Vercel's default bodyParser so Express and Multer handle raw streams & multipart forms cleanly
const serverlessConfig = {
  api: {
    bodyParser: false,
    externalResolver: true
  }
};

handler.config = serverlessConfig;
module.exports = handler;
module.exports.config = serverlessConfig;

