const express = require("express");
const {
  getProblems,
  getProblemById,
  getTopics,
  getDsaSheet,
  getDailyChallenge,
  runCode,
  submitCode,
  getProblemSubmissions,
  getUserProgress,
  toggleBookmark,
  getBookmarks,
  handleAiCoachAction,
  getJobDsaPrep,
} = require("../controllers/dsaController");
const { protect, optionalAuth } = require("../middleware/authMiddleware");

const router = express.Router();

// Public / Optional Auth routes
router.get("/problems", optionalAuth, getProblems);
router.get("/problems/:idOrSlug", optionalAuth, getProblemById);
router.get("/topics", optionalAuth, getTopics);
router.get("/sheet", optionalAuth, getDsaSheet);
router.get("/daily-challenge", optionalAuth, getDailyChallenge);
router.get("/job-prep/:jobId", optionalAuth, getJobDsaPrep);

// Code Execution (Run can be optionalAuth, submit requires protect)
router.post("/run", optionalAuth, runCode);
router.post("/submit", protect, submitCode);

// User-specific protected routes
router.get("/submissions/:problemId", protect, getProblemSubmissions);
router.get("/progress", protect, getUserProgress);
router.post("/bookmark/:problemId", protect, toggleBookmark);
router.get("/bookmarks", protect, getBookmarks);

// AI Coach endpoint
router.post("/ai/:action", protect, handleAiCoachAction);

module.exports = router;
