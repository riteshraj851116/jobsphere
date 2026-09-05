const path = require("path");

// Load backend environment variables if present
try {
  require("dotenv").config({ path: path.join(__dirname, "../backend/.env") });
  require("dotenv").config();
} catch (e) {
  // Dotenv is optional in serverless
}

const app = require("../backend/Server");

// Serverless URL normalization middleware
app.use((req, res, next) => {
  const matched = req.headers["x-matched-path"];
  if (matched && matched.startsWith("/api")) {
    req.url = matched;
  } else if (req.url === "/api/index.js" || req.url.startsWith("/api/index.js")) {
    req.url = req.url.replace(/^\/api\/index\.js\/?/, "/api/");
  } else if (req.url && !req.url.startsWith("/api")) {
    req.url = "/api" + (req.url.startsWith("/") ? req.url : "/" + req.url);
  }
  next();
});

module.exports = app;
