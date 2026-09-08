const DSAProblem = require("../models/DSAProblem");
const DSASubmission = require("../models/DSASubmission");
const DSAProgress = require("../models/DSAProgress");
const DSABookmark = require("../models/DSABookmark");
const dsaService = require("../services/dsaService");
const { executeCode } = require("../services/dsaExecutionService");
const dsaAiService = require("../services/dsaAiService");

/**
 * GET /api/dsa/problems
 * Query params: search, difficulty, topic, status, sheetCategory, page, limit
 */
async function getProblems(req, res) {
  try {
    const {
      search,
      difficulty,
      topic,
      status,
      sheetCategory,
      page = 1,
      limit = 20,
    } = req.query;

    const result = await dsaService.getProblems({
      userId: req.user?._id,
      search,
      difficulty,
      topic,
      status,
      sheetCategory,
      page: Number(page),
      limit: Number(limit),
    });

    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error("Error in getProblems:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to retrieve DSA problems",
    });
  }
}

/**
 * GET /api/dsa/problems/:idOrSlug
 */
async function getProblemById(req, res) {
  try {
    const { idOrSlug } = req.params;
    const problem = await dsaService.getProblemDetails(idOrSlug, req.user?._id);

    if (!problem) {
      return res.status(404).json({
        success: false,
        message: "DSA Problem not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: problem,
    });
  } catch (error) {
    console.error("Error in getProblemById:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to retrieve problem details",
    });
  }
}

/**
 * GET /api/dsa/topics
 */
async function getTopics(req, res) {
  try {
    const topics = await dsaService.getTopicsSummary(req.user?._id);
    return res.status(200).json({
      success: true,
      data: topics,
    });
  } catch (error) {
    console.error("Error in getTopics:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to retrieve topics",
    });
  }
}

/**
 * GET /api/dsa/sheet
 */
async function getDsaSheet(req, res) {
  try {
    const sheet = await dsaService.getDsaSheetRoadmap(req.user?._id);
    return res.status(200).json({
      success: true,
      data: sheet,
    });
  } catch (error) {
    console.error("Error in getDsaSheet:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to retrieve DSA Sheet roadmap",
    });
  }
}

/**
 * GET /api/dsa/daily-challenge
 */
async function getDailyChallenge(req, res) {
  try {
    const challenge = await dsaService.getDailyChallenge(req.user?._id);
    return res.status(200).json({
      success: true,
      data: challenge,
    });
  } catch (error) {
    console.error("Error in getDailyChallenge:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to retrieve daily challenge",
    });
  }
}

/**
 * POST /api/dsa/run
 * Runs user code against visible sample test cases safely
 */
async function runCode(req, res) {
  try {
    const { problemId, language, code } = req.body;

    if (!problemId || !code || !language) {
      return res.status(400).json({
        success: false,
        message: "problemId, language, and code are required",
      });
    }

    const problem = await DSAProblem.findById(problemId);
    if (!problem) {
      return res.status(404).json({
        success: false,
        message: "Problem not found",
      });
    }

    const testCases = problem.sampleTestCases || [];
    if (testCases.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Problem has no sample test cases configured",
      });
    }

    const executionResult = await executeCode({
      code,
      language,
      functionName: problem.functionName,
      testCases,
      isSubmission: false,
    });

    // Update streak for active coding session
    if (req.user?._id) {
      const progress = await dsaService.getOrCreateProgress(req.user._id);
      dsaService.updateStreakOnActivity(progress);
      await progress.save();
    }

    return res.status(200).json({
      success: true,
      data: executionResult,
    });
  } catch (error) {
    console.error("Error in runCode:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Code execution failed",
    });
  }
}

/**
 * POST /api/dsa/submit
 * Runs user code against complete hidden test suite and records submission
 */
async function submitCode(req, res) {
  try {
    const { problemId, language, code } = req.body;
    const userId = req.user._id;

    if (!problemId || !code || !language) {
      return res.status(400).json({
        success: false,
        message: "problemId, language, and code are required",
      });
    }

    // Retrieve problem with hidden test cases
    const problem = await DSAProblem.findById(problemId).select("+hiddenTestCases");
    if (!problem) {
      return res.status(404).json({
        success: false,
        message: "Problem not found",
      });
    }

    // Combine sample and hidden test cases for full judging suite
    const fullTestSuite = [
      ...(problem.sampleTestCases || []),
      ...(problem.hiddenTestCases || []),
    ];

    const executionResult = await executeCode({
      code,
      language,
      functionName: problem.functionName,
      testCases: fullTestSuite,
      isSubmission: true,
    });

    // Record submission and update user progress in database
    const submission = await dsaService.recordSubmission({
      userId,
      problemId: problem._id,
      language,
      code,
      executionResult,
    });

    return res.status(200).json({
      success: true,
      data: {
        submissionId: submission._id,
        status: executionResult.status,
        passedCount: executionResult.passedCount,
        totalTestCases: executionResult.totalTestCases,
        runtime: executionResult.runtime,
        memory: executionResult.memory,
        failedTestCase: executionResult.failedTestCase,
        errorMessage: executionResult.errorMessage,
        createdAt: submission.createdAt,
      },
    });
  } catch (error) {
    console.error("Error in submitCode:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Submission processing failed",
    });
  }
}

/**
 * GET /api/dsa/submissions/:problemId
 */
async function getProblemSubmissions(req, res) {
  try {
    const { problemId } = req.params;
    const userId = req.user._id;

    const submissions = await DSASubmission.find({
      user: userId,
      problem: problemId,
    })
      .sort({ createdAt: -1 })
      .limit(30)
      .lean();

    return res.status(200).json({
      success: true,
      data: submissions,
    });
  } catch (error) {
    console.error("Error in getProblemSubmissions:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to retrieve submissions",
    });
  }
}

/**
 * GET /api/dsa/progress
 */
async function getUserProgress(req, res) {
  try {
    const userId = req.user._id;
    const [progress, totalProblemsCount, recentSubmissions] = await Promise.all([
      dsaService.getOrCreateProgress(userId),
      DSAProblem.countDocuments(),
      DSASubmission.find({ user: userId })
        .populate("problem", "title difficulty slug")
        .sort({ createdAt: -1 })
        .limit(10)
        .lean(),
    ]);

    const solvedCount = progress.solvedProblems?.length || 0;
    const attemptedCount = progress.attemptedProblems?.length || 0;
    const acceptanceRate =
      progress.totalSubmissions > 0
        ? Math.round((progress.acceptedSubmissions / progress.totalSubmissions) * 100)
        : 0;

    // Convert topic stats map to plain object
    const topicStatsObj = {};
    if (progress.topicStats) {
      for (const [key, val] of progress.topicStats.entries()) {
        topicStatsObj[key] = val;
      }
    }

    // Generate AI recommendations based on progress
    const aiRec = await dsaAiService.generateRecommendations({
      progress,
      allTopics: dsaService.DSA_TOPICS,
    });

    return res.status(200).json({
      success: true,
      data: {
        totalProblems: totalProblemsCount,
        solvedCount,
        attemptedCount,
        acceptanceRate,
        streak: progress.streak,
        difficultyStats: progress.difficultyStats,
        topicStats: topicStatsObj,
        recentSubmissions,
        aiRecommendation: aiRec,
      },
    });
  } catch (error) {
    console.error("Error in getUserProgress:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to retrieve user progress",
    });
  }
}

/**
 * POST /api/dsa/bookmark/:problemId
 */
async function toggleBookmark(req, res) {
  try {
    const { problemId } = req.params;
    const userId = req.user._id;

    const existing = await DSABookmark.findOne({ user: userId, problem: problemId });
    if (existing) {
      await DSABookmark.findByIdAndDelete(existing._id);
      return res.status(200).json({
        success: true,
        isBookmarked: false,
        message: "Problem removed from bookmarks",
      });
    } else {
      await DSABookmark.create({ user: userId, problem: problemId });
      return res.status(200).json({
        success: true,
        isBookmarked: true,
        message: "Problem saved to bookmarks",
      });
    }
  } catch (error) {
    console.error("Error in toggleBookmark:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to toggle bookmark",
    });
  }
}

/**
 * GET /api/dsa/bookmarks
 */
async function getBookmarks(req, res) {
  try {
    const userId = req.user._id;
    const bookmarks = await DSABookmark.find({ user: userId })
      .populate("problem")
      .sort({ createdAt: -1 })
      .lean();

    return res.status(200).json({
      success: true,
      data: bookmarks.map((b) => b.problem).filter(Boolean),
    });
  } catch (error) {
    console.error("Error in getBookmarks:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to retrieve bookmarks",
    });
  }
}

/**
 * POST /api/dsa/ai/:action
 * AI Coach actions: 'hint', 'explain', 'complexity', 'review', 'debug', 'solution'
 */
async function handleAiCoachAction(req, res) {
  try {
    const { action } = req.params;
    const {
      problemId,
      userCode = "",
      language = "javascript",
      hintLevel = 1,
      submissionResult = null,
      failedTestCase = null,
      errorMessage = "",
    } = req.body;

    if (!problemId) {
      return res.status(400).json({
        success: false,
        message: "problemId is required",
      });
    }

    const problem = await DSAProblem.findById(problemId).lean();
    if (!problem) {
      return res.status(404).json({
        success: false,
        message: "Problem not found",
      });
    }

    let responseData = {};

    switch (action) {
      case "hint":
        responseData = await dsaAiService.generateHint({
          problem,
          userCode,
          language,
          hintLevel: Number(hintLevel) || 1,
        });
        break;

      case "explain":
        responseData = await dsaAiService.explainSimply({ problem });
        break;

      case "complexity":
        responseData = await dsaAiService.analyzeComplexity({
          problem,
          userCode,
          language,
        });
        break;

      case "review":
        responseData = await dsaAiService.reviewCode({
          problem,
          userCode,
          language,
          submissionResult,
        });
        break;

      case "debug":
        responseData = await dsaAiService.debugCode({
          problem,
          userCode,
          language,
          failedTestCase,
          errorMessage,
        });
        break;

      case "solution":
        responseData = await dsaAiService.getSolution({
          problem,
          language,
        });
        break;

      default:
        return res.status(400).json({
          success: false,
          message: `Unknown AI action: ${action}. Valid actions: hint, explain, complexity, review, debug, solution`,
        });
    }

    return res.status(200).json({
      success: true,
      action,
      data: responseData,
    });
  } catch (error) {
    console.error(`Error in AI Coach action (${req.params.action}):`, error);
    return res.status(500).json({
      success: false,
      message: error.message || "AI Coach request failed",
    });
  }
}

/**
 * GET /api/dsa/job-prep/:jobId
 */
async function getJobDsaPrep(req, res) {
  try {
    const { jobId } = req.params;
    const prepData = await dsaService.getJobDsaPreparation(jobId, req.user?._id);

    if (!prepData) {
      return res.status(404).json({
        success: false,
        message: "Job not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: prepData,
    });
  } catch (error) {
    console.error("Error in getJobDsaPrep:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to retrieve job preparation DSA data",
    });
  }
}

module.exports = {
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
};
