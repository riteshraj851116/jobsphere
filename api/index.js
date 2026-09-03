require("dotenv").config();

let app;
let connectDB;

try {
  app = require("../backend/Server");
  connectDB = require("../backend/config/db");
} catch (err) {
  console.error("Vercel Serverless module load error:", err);
}

module.exports = async (req, res) => {
  try {
    if (connectDB) {
      await connectDB();
    }
  } catch (err) {
    console.error("Vercel Serverless MongoDB error:", err.message);
  }

  if (app) {
    return app(req, res);
  }

  return res.status(500).json({
    success: false,
    message: "Serverless backend initialization error"
  });
};
