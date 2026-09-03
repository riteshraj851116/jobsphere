const path = require("path");
require("dotenv").config();
try {
  require("dotenv").config({ path: path.join(__dirname, "../backend/.env") });
} catch (e) {}

let app;
let initError = null;

try {
  app = require("../backend/Server");
} catch (err) {
  console.error("Vercel backend initialization error:", err);
  initError = err;
}

module.exports = (req, res) => {
  if (initError) {
    return res.status(500).json({
      success: false,
      message: "Serverless backend initialization error",
      error: initError.message,
      stack: initError.stack
    });
  }
  return app(req, res);
};
