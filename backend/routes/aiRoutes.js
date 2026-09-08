const express = require("express");

const {
  chatWithAI,
} = require("../controllers/aiController");

const {
  protect,
  optionalAuth,
} = require("../middleware/authMiddleware");

const router = express.Router();

/*
 * POST /api/ai/chat
 *
 * Optional Auth route:
 * Logged-in users get personalized profile-based career guidance.
 * Guest users get full tech career assistance and platform job recommendations.
 */
router.post(
  "/chat",
  optionalAuth,
  chatWithAI
);

module.exports = router;