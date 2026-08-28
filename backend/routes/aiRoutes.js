const express = require("express");

const {
  chatWithAI,
} = require("../controllers/aiController");

const {
  protect,
} = require("../middleware/authMiddleware");

const router = express.Router();

/*
 * POST /api/ai/chat
 *
 * Protected route:
 * Sirf logged-in user AI Career Assistant use kar sakta hai.
 */
router.post(
  "/chat",
  protect,
  chatWithAI
);

module.exports = router;