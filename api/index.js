const path = require("path");
require("dotenv").config();
try {
  require("dotenv").config({ path: path.join(__dirname, "../backend/.env") });
} catch (e) {}

const app = require("../backend/Server");

module.exports = app;
