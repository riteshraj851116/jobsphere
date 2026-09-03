const app = require("../backend/Server");
const connectDB = require("../backend/config/db");

module.exports = async (req, res) => {
  try {
    await connectDB();
  } catch (err) {
    console.error("Vercel Serverless MongoDB connection error:", err);
  }
  return app(req, res);
};
