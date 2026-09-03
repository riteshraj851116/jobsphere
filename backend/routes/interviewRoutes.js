const express = require("express");
const {
  getQuestions,
  startInterview,
  getSession,
  saveAnswer,
  completeInterview,
  getInterviewHistory
} = require("../controllers/interviewController");

const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

// All interview routes require authentication
router.use(protect);

// Practice questions catalog
router.get("/questions", getQuestions);

// Start practice interview session
router.post("/start", startInterview);

// User's interview history
router.get("/history", getInterviewHistory);

// Specific session routes
router.get("/:sessionId", getSession);
router.put("/:sessionId/answer", saveAnswer);
router.post("/:sessionId/complete", completeInterview);

module.exports = router;
