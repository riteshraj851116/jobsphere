const mongoose = require("mongoose");
const InterviewQuestion = require("../models/InterviewQuestion");
const InterviewSession = require("../models/InterviewSession");
const { isValidObjectId } = require("../middleware/validateObjectId");

// =========================================================
// @desc    Get questions with optional filters
// @route   GET /api/interview/questions
// @access  Private
// =========================================================
const getQuestions = async (req, res) => {
  try {
    const { role, difficulty, category, limit = 50 } = req.query;

    const filter = {};
    if (role) {
      filter.role = new RegExp(`^${role.trim()}$`, "i");
    }
    if (difficulty) {
      filter.difficulty = difficulty.toLowerCase().trim();
    }
    if (category) {
      filter.category = new RegExp(`^${category.trim()}$`, "i");
    }

    const questions = await InterviewQuestion.find(filter)
      .limit(Number(limit))
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: questions.length,
      data: questions
    });
  } catch (error) {
    console.error("Get Questions Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch interview questions"
    });
  }
};

// =========================================================
// @desc    Start a new practice interview session
// @route   POST /api/interview/start
// @access  Private
// =========================================================
const startInterview = async (req, res) => {
  try {
    const { role, difficulty, questionCount } = req.body;

    const selectedRole = (role || "MERN Stack Developer").trim();
    const selectedDifficulty = (difficulty || "medium").toLowerCase().trim();
    const count = Math.min(Math.max(Number(questionCount) || 5, 1), 30);

    // 1. Primary search: exact role and difficulty
    let matchingQuestions = await InterviewQuestion.find({
      role: new RegExp(`^${selectedRole}$`, "i"),
      difficulty: selectedDifficulty
    });

    // 2. Secondary fallback: same role, any difficulty if needed
    if (matchingQuestions.length < count) {
      const existingIds = matchingQuestions.map((q) => q._id);
      const moreFromRole = await InterviewQuestion.find({
        role: new RegExp(`^${selectedRole}$`, "i"),
        _id: { $nin: existingIds }
      });
      matchingQuestions = [...matchingQuestions, ...moreFromRole];
    }

    // 3. Related role fallback if still fewer than requested
    if (matchingQuestions.length < count) {
      const existingIds = matchingQuestions.map((q) => q._id);
      let relatedCategories = [];

      if (selectedRole.toLowerCase().includes("mern") || selectedRole.toLowerCase().includes("full stack")) {
        relatedCategories = ["JavaScript", "React", "Node.js", "MongoDB", "MERN Stack", "Full Stack"];
      } else if (selectedRole.toLowerCase().includes("react") || selectedRole.toLowerCase().includes("frontend")) {
        relatedCategories = ["JavaScript", "React", "Frontend"];
      } else if (selectedRole.toLowerCase().includes("node") || selectedRole.toLowerCase().includes("backend")) {
        relatedCategories = ["Node.js", "Backend", "MongoDB", "JavaScript"];
      } else if (selectedRole.toLowerCase().includes("hr")) {
        relatedCategories = ["HR"];
      }

      if (relatedCategories.length > 0) {
        const related = await InterviewQuestion.find({
          category: { $in: relatedCategories },
          _id: { $nin: existingIds }
        });
        matchingQuestions = [...matchingQuestions, ...related];
      }
    }

    // 4. Global fallback if still not enough
    if (matchingQuestions.length === 0) {
      matchingQuestions = await InterviewQuestion.find({});
    }

    if (matchingQuestions.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No interview questions found in the database. Please seed questions first."
      });
    }

    // Shuffle questions and select up to requested count
    const shuffled = [...matchingQuestions].sort(() => 0.5 - Math.random());
    const selectedQuestions = shuffled.slice(0, count);

    // Create session in DB
    const session = await InterviewSession.create({
      user: req.user._id,
      role: selectedRole,
      difficulty: selectedDifficulty,
      totalQuestions: selectedQuestions.length,
      questions: selectedQuestions.map((q) => q._id),
      answers: [],
      startedAt: new Date(),
      status: "in_progress"
    });

    const populatedSession = await InterviewSession.findById(session._id).populate("questions");

    return res.status(201).json({
      success: true,
      message: "Interview session started successfully",
      data: populatedSession
    });
  } catch (error) {
    console.error("Start Interview Error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to start interview session"
    });
  }
};

// =========================================================
// @desc    Get specific interview session details
// @route   GET /api/interview/:sessionId
// @access  Private
// =========================================================
const getSession = async (req, res) => {
  try {
    const { sessionId } = req.params;

    if (!isValidObjectId(sessionId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid session ID"
      });
    }

    const session = await InterviewSession.findById(sessionId).populate("questions");

    if (!session) {
      return res.status(404).json({
        success: false,
        message: "Interview session not found"
      });
    }

    // Authorization check: only owner can view session
    if (session.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to view this interview session"
      });
    }

    return res.status(200).json({
      success: true,
      data: session
    });
  } catch (error) {
    console.error("Get Session Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to retrieve interview session"
    });
  }
};

// =========================================================
// @desc    Save or update answer for a question in a session
// @route   PUT /api/interview/:sessionId/answer
// @access  Private
// =========================================================
const saveAnswer = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { questionId, answer, skipped } = req.body;

    if (!isValidObjectId(sessionId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid session ID"
      });
    }

    if (!questionId || !isValidObjectId(questionId)) {
      return res.status(400).json({
        success: false,
        message: "Valid question ID is required"
      });
    }

    const session = await InterviewSession.findById(sessionId);

    if (!session) {
      return res.status(404).json({
        success: false,
        message: "Interview session not found"
      });
    }

    if (session.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to update this interview session"
      });
    }

    // Find if question is in the session questions list
    const isQuestionInSession = session.questions.some(
      (qId) => qId.toString() === questionId.toString()
    );

    if (!isQuestionInSession) {
      return res.status(400).json({
        success: false,
        message: "Question does not belong to this interview session"
      });
    }

    // Check if answer already exists
    const existingAnswerIndex = session.answers.findIndex(
      (a) => a.questionId.toString() === questionId.toString()
    );

    const isSkipped = Boolean(skipped);
    const answerText = typeof answer === "string" ? answer : "";

    if (existingAnswerIndex >= 0) {
      session.answers[existingAnswerIndex].answer = answerText;
      session.answers[existingAnswerIndex].skipped = isSkipped;
      session.answers[existingAnswerIndex].answeredAt = new Date();
    } else {
      session.answers.push({
        questionId,
        answer: answerText,
        skipped: isSkipped,
        answeredAt: new Date()
      });
    }

    await session.save();

    const updatedSession = await InterviewSession.findById(sessionId).populate("questions");

    return res.status(200).json({
      success: true,
      message: "Answer saved successfully",
      data: updatedSession
    });
  } catch (error) {
    console.error("Save Answer Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to save answer"
    });
  }
};

// =========================================================
// @desc    Complete interview session
// @route   POST /api/interview/:sessionId/complete
// @access  Private
// =========================================================
const completeInterview = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { duration } = req.body;

    if (!isValidObjectId(sessionId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid session ID"
      });
    }

    const session = await InterviewSession.findById(sessionId);

    if (!session) {
      return res.status(404).json({
        success: false,
        message: "Interview session not found"
      });
    }

    if (session.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to complete this interview session"
      });
    }

    const now = new Date();
    const calculatedDuration =
      duration !== undefined && !isNaN(Number(duration))
        ? Number(duration)
        : Math.max(0, Math.round((now.getTime() - new Date(session.startedAt).getTime()) / 1000));

    session.status = "completed";
    session.completedAt = now;
    session.duration = calculatedDuration;

    await session.save();

    const populatedSession = await InterviewSession.findById(sessionId).populate("questions");

    return res.status(200).json({
      success: true,
      message: "Interview completed successfully",
      data: populatedSession
    });
  } catch (error) {
    console.error("Complete Interview Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to complete interview session"
    });
  }
};

// =========================================================
// @desc    Get user's previous interview history
// @route   GET /api/interview/history
// @access  Private
// =========================================================
const getInterviewHistory = async (req, res) => {
  try {
    const sessions = await InterviewSession.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .populate("questions");

    return res.status(200).json({
      success: true,
      count: sessions.length,
      data: sessions
    });
  } catch (error) {
    console.error("Get Interview History Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to retrieve interview history"
    });
  }
};

module.exports = {
  getQuestions,
  startInterview,
  getSession,
  saveAnswer,
  completeInterview,
  getInterviewHistory
};
