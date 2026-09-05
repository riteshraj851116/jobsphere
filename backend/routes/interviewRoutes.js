const express = require("express");
const {
  getQuestions,
  startInterview,
  getSession,
  saveAnswer,
  completeInterview,
  getInterviewHistory,
  evaluateAnswer
} = require("../controllers/interviewController");

const { protect, optionalAuth } = require("../middleware/authMiddleware");

const router = express.Router();

// Practice questions catalog (Public / Optional Auth)
router.get("/questions", optionalAuth, getQuestions);

// Instant AI Answer Evaluation
router.post("/evaluate-answer", optionalAuth, evaluateAnswer);

// Start practice interview session (Logged-in or Guest)
router.post("/start", optionalAuth, startInterview);

// User's interview history
router.get("/history", optionalAuth, getInterviewHistory);

// Specific session routes
router.get("/:sessionId", optionalAuth, getSession);
router.put("/:sessionId/answer", optionalAuth, saveAnswer);
router.post("/:sessionId/complete", optionalAuth, completeInterview);

module.exports = router;
