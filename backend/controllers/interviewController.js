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
    const rawDiff = (difficulty || "").toLowerCase().trim();
    let normalizedDifficulty = "medium";
    if (rawDiff === "beginner" || rawDiff === "easy") {
      normalizedDifficulty = "easy";
    } else if (rawDiff === "hard" || rawDiff === "advanced" || rawDiff === "expert") {
      normalizedDifficulty = "hard";
    } else {
      normalizedDifficulty = "medium";
    }
    const difficultyFilters = Array.from(new Set([normalizedDifficulty, rawDiff].filter(Boolean)));
    const count = Math.min(Math.max(Number(questionCount) || 5, 1), 30);

    // 1. Primary search: exact role and difficulty
    let matchingQuestions = await InterviewQuestion.find({
      role: new RegExp(`^${selectedRole}$`, "i"),
      difficulty: { $in: difficultyFilters }
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

    // 5. Automatic seed if questions collection is empty in production
    if (matchingQuestions.length === 0) {
      try {
        const { questionsData } = require("../seed/interviewQuestions");
        if (Array.isArray(questionsData) && questionsData.length > 0) {
          const inserted = await InterviewQuestion.insertMany(questionsData);
          matchingQuestions = inserted;
        }
      } catch (seedErr) {
        console.warn("Auto-seed questions warning:", seedErr.message);
      }
    }

    // 6. Resilient inline fallback questions if database seeding was skipped
    if (matchingQuestions.length === 0) {
      const fallbackQuestions = [
        {
          _id: new mongoose.Types.ObjectId(),
          role: selectedRole,
          category: "General",
          difficulty: normalizedDifficulty,
          type: "technical",
          question: `Can you describe your experience with ${selectedRole} and your core technical workflow?`,
          expectedAnswer: "A comprehensive walkthrough of core concepts, architecture, state management, and modern production best practices.",
          explanation: "Core competency and conceptual understanding question."
        },
        {
          _id: new mongoose.Types.ObjectId(),
          role: selectedRole,
          category: "Architecture",
          difficulty: normalizedDifficulty,
          type: "technical",
          question: "How do you handle asynchronous operations, error handling, and performance optimization in production?",
          expectedAnswer: "Using modern async/await, try/catch patterns, memoization, indexing, and connection caching.",
          explanation: "Production resilience and scalability question."
        },
        {
          _id: new mongoose.Types.ObjectId(),
          role: selectedRole,
          category: "Security",
          difficulty: normalizedDifficulty,
          type: "technical",
          question: "What security measures do you implement when designing and consuming REST APIs?",
          expectedAnswer: "JWT verification, CORS policies, rate limiting, data sanitization, and parameterized queries.",
          explanation: "API security and defense-in-depth principles."
        }
      ];
      matchingQuestions = fallbackQuestions;
    }

    // Shuffle questions and select up to requested count
    const shuffled = [...matchingQuestions].sort(() => 0.5 - Math.random());
    const selectedQuestions = shuffled.slice(0, count);

    // Create session in DB
    const session = await InterviewSession.create({
      user: req.user ? req.user._id : null,
      role: selectedRole,
      difficulty: normalizedDifficulty,
      totalQuestions: selectedQuestions.length,
      questions: selectedQuestions.map((q) => q._id),
      answers: [],
      startedAt: new Date(),
      status: "in_progress"
    });

    const populatedSession = await InterviewSession.findById(session._id).populate("questions");
    const responseSession = populatedSession ? populatedSession.toObject() : session.toObject();
    if (!responseSession.questions || responseSession.questions.length === 0 || !responseSession.questions[0]?.question) {
      responseSession.questions = selectedQuestions;
    }

    return res.status(201).json({
      success: true,
      message: "Interview session started successfully",
      data: responseSession
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

    // Authorization check: owner or guest session
    const isOwner =
      !session.user ||
      !req.user ||
      session.user?.toString() === req.user?._id?.toString() ||
      req.user?.isGuest ||
      session.user?.toString() === "6a9401084d788adc6a04e900";

    if (!isOwner) {
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

    const isOwner =
      !session.user ||
      !req.user ||
      session.user?.toString() === req.user?._id?.toString() ||
      req.user?.isGuest ||
      session.user?.toString() === "6a9401084d788adc6a04e900";

    if (!isOwner) {
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

    const isOwner =
      !session.user ||
      !req.user ||
      session.user?.toString() === req.user?._id?.toString() ||
      req.user?.isGuest ||
      session.user?.toString() === "6a9401084d788adc6a04e900";

    if (!isOwner) {
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

    // Calculate realistic score and performance breakdown
    const answeredAnswers = (session.answers || []).filter(
      (a) => !a.skipped && a.answer && a.answer.trim().length > 0
    );
    const totalQ = (session.questions || []).length || 1;
    const answeredRatio = answeredAnswers.length / totalQ;
    const avgLen =
      answeredAnswers.reduce((acc, a) => acc + (a.answer ? a.answer.length : 0), 0) /
      (answeredAnswers.length || 1);
    const depthFactor = Math.min(avgLen / 120, 1);

    const calculatedScore = Math.round(answeredRatio * 65 + depthFactor * 25 + 10);
    session.score = Math.min(Math.max(calculatedScore, 25), 98);

    if (session.score >= 80) {
      session.feedback = "Strong grasp of fundamental concepts and articulate technical communication.";
      session.strengths = ["Comprehensive explanations", "Role-specific terminology", "Clear structural flow"];
      session.improvements = ["Include concrete production examples and performance optimization tradeoffs."];
    } else if (session.score >= 60) {
      session.feedback = "Solid foundational knowledge. Expanding on implementation details will elevate your answers.";
      session.strengths = ["Correct identification of core concepts", "Direct responses"];
      session.improvements = ["Provide deeper architectural reasoning and mention edge case handling."];
    } else {
      session.feedback = "Good practice attempt. Deepen your revision of key terminology and practice STAR method responses.";
      session.strengths = ["Willingness to attempt diverse questions"];
      session.improvements = ["Elaborate further on practical examples and explain underlying mechanisms."];
    }

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
// @desc    Get user interview session history
// @route   GET /api/interview/history
// @access  Public / Optional Auth
// =========================================================
const getInterviewHistory = async (req, res) => {
  try {
    const userId = req.user?._id || req.user?.id;
    const query = userId ? { user: userId } : {};

    const history = await InterviewSession.find(query)
      .populate("questions", "question difficulty category role")
      .sort({ createdAt: -1 })
      .limit(20)
      .lean();

    return res.status(200).json({
      success: true,
      count: history.length,
      data: history
    });
  } catch (error) {
    console.error("Get Interview History Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch interview history"
    });
  }
};

// =========================================================
// @desc    AI Instant Answer Evaluation
// @route   POST /api/interview/evaluate-answer
// @access  Public / Optional Auth
// =========================================================
const evaluateAnswer = async (req, res) => {
  try {
    const { question, expectedAnswer, answer, role, difficulty } = req.body;

    const userAns = String(answer || "").trim();
    if (!userAns || userAns.length < 5) {
      return res.status(400).json({
        success: false,
        message: "Please provide a more detailed answer to evaluate (at least 5 characters)."
      });
    }

    const targetQuestion = String(question || "Technical Question").trim();
    const modelAnswer = String(expectedAnswer || "").trim();

    // Semantic heuristic evaluation baseline
    const words = userAns.toLowerCase().split(/\s+/).filter(Boolean);
    const wordCount = words.length;

    // Extract key conceptual tokens from model answer
    const stopWords = new Set(["the", "and", "that", "this", "with", "from", "for", "are", "was", "were", "what", "which", "how", "used", "using", "can"]);
    const modelTokens = modelAnswer
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, " ")
      .split(/\s+/)
      .filter((w) => w.length > 3 && !stopWords.has(w));

    const matchedTokens = modelTokens.filter((token) => words.includes(token));
    const uniqueMatches = [...new Set(matchedTokens)];
    const uniqueTotal = [...new Set(modelTokens)].length || 1;

    const matchRatio = Math.min(uniqueMatches.length / uniqueTotal, 1);

    // Calculate score out of 100
    let score = Math.round(matchRatio * 50 + Math.min(wordCount / 35, 1) * 35 + 15);
    score = Math.min(Math.max(score, 45), 98);

    let rating = "Good";
    if (score >= 85) rating = "Excellent";
    else if (score >= 70) rating = "Solid";
    else if (score < 60) rating = "Needs Improvement";

    const strengths = [];
    if (wordCount > 25) strengths.push("Clear structure and depth in technical explanation.");
    if (uniqueMatches.length > 0) strengths.push(`Identified core concepts: ${uniqueMatches.slice(0, 3).join(", ")}.`);
    strengths.push("Good conversational delivery suitable for an interview setting.");

    const improvements = [];
    const missing = [...new Set(modelTokens.filter((t) => !words.includes(t)))];
    if (missing.length > 0) {
      improvements.push(`Consider mentioning keywords: ${missing.slice(0, 4).join(", ")}.`);
    }
    if (wordCount < 30) {
      improvements.push("Expand on practical real-world production examples or trade-offs.");
    }
    improvements.push("Structure response using STAR (Situation, Task, Action, Result) if applicable.");

    // AI API Evaluation if configured
    if (process.env.GEMINI_API_KEY) {
      try {
        let GoogleGenAIClass = null;
        try {
          GoogleGenAIClass = require("@google/genai").GoogleGenAI;
        } catch (e) {}

        if (GoogleGenAIClass) {
          const ai = new GoogleGenAIClass({ apiKey: process.env.GEMINI_API_KEY });
          const prompt = `You are a technical interviewer evaluating an answer.
Question: "${targetQuestion}"
Target Role: "${role || 'Software Engineer'}"
Difficulty: "${difficulty || 'medium'}"
Sample Expected Concept: "${modelAnswer}"
Candidate's Answer: "${userAns}"

Return ONLY valid JSON with keys:
{
  "score": (integer 45-98),
  "rating": ("Excellent" | "Solid" | "Good" | "Needs Improvement"),
  "feedback": (string with 1-3 sentences of constructive evaluation),
  "strengths": [(2 concise bullet points)],
  "improvements": [(2 concise bullet points of missing concepts or tips)]
}`;
          const aiRes = await ai.models.generateContent({
            model: process.env.GEMINI_MODEL || "gemini-2.5-flash",
            contents: prompt,
            config: { responseMimeType: "application/json" }
          });

          if (aiRes?.text) {
            const parsed = JSON.parse(aiRes.text.trim());
            if (parsed && typeof parsed.score === "number") {
              return res.status(200).json({
                success: true,
                data: {
                  score: parsed.score,
                  rating: parsed.rating || rating,
                  feedback: parsed.feedback || "Answer evaluated.",
                  strengths: Array.isArray(parsed.strengths) ? parsed.strengths : strengths,
                  improvements: Array.isArray(parsed.improvements) ? parsed.improvements : improvements,
                  sampleAnswer: modelAnswer
                }
              });
            }
          }
        }
      } catch (geminiError) {
        console.warn("AI evaluation fallback triggered:", geminiError.message);
      }
    }

    return res.status(200).json({
      success: true,
      data: {
        score,
        rating,
        feedback: `Your response shows ${rating.toLowerCase()} understanding of this concept. ${score >= 75 ? "You clearly hit the primary technical points." : "Try incorporating more specific architectural terminology and real-world trade-offs."}`,
        strengths,
        improvements,
        sampleAnswer: modelAnswer
      }
    });
  } catch (error) {
    console.error("Evaluate Answer Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to evaluate answer"
    });
  }
};

module.exports = {
  getQuestions,
  startInterview,
  getSession,
  saveAnswer,
  completeInterview,
  getInterviewHistory,
  evaluateAnswer
};
