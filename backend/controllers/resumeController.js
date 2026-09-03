const ResumeAnalysis = require("../models/ResumeAnalysis");
const Job = require("../models/Job");
const { isValidObjectId } = require("../middleware/validateObjectId");
const {
  extractTextFromBuffer,
  analyzeResume: runAtsAnalysis
} = require("../services/atsAnalysisService");

// =========================================================
// @desc    Analyze uploaded resume against Job or Job Description
// @route   POST /api/resume/analyze
// @access  Private
// =========================================================
const analyzeResume = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Please upload a resume file (PDF or DOCX format)."
      });
    }

    const { jobId, jobTitle: customTitle, jobDescription: customDesc } = req.body;

    let targetTitle = customTitle || "Custom Job Description";
    let targetDescription = customDesc || "";
    let targetSkills = [];
    let linkedJobId = null;

    // If jobId is provided, retrieve job details from database
    if (jobId && isValidObjectId(jobId)) {
      const job = await Job.findById(jobId).populate("company", "name");
      if (job) {
        linkedJobId = job._id;
        targetTitle = `${job.title}${job.company?.name ? ` at ${job.company.name}` : ""}`;
        targetDescription = `${job.description}\n\nRequirements:\n${(job.requirements || []).join("\n")}\n\nResponsibilities:\n${(job.responsibilities || []).join("\n")}`;
        targetSkills = job.skills || [];
      }
    }

    if (!targetDescription || targetDescription.trim().length < 10) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid job description or select an existing job."
      });
    }

    // Extract text from uploaded resume buffer
    let extractedText = "";
    try {
      extractedText = await extractTextFromBuffer(
        req.file.buffer,
        req.file.mimetype,
        req.file.originalname
      );
    } catch (parseError) {
      console.error("Text extraction failed:", parseError);
      return res.status(422).json({
        success: false,
        message: "Unable to parse resume text. Please ensure the file is a valid PDF or DOCX."
      });
    }

    if (!extractedText || extractedText.trim().length < 30) {
      return res.status(422).json({
        success: false,
        message: "Could not extract readable text from the uploaded resume. Please upload a non-scanned PDF or DOCX file."
      });
    }

    // Run ATS Analysis Engine
    const analysisResults = runAtsAnalysis(
      extractedText,
      targetDescription,
      targetSkills,
      targetTitle
    );

    let savedAnalysis = null;
    try {
      savedAnalysis = await ResumeAnalysis.create({
        user: req.user?._id || "6a9401084d788adc6a04e900",
        resumeFileName: req.file.originalname || "resume.pdf",
        resumeText: extractedText.slice(0, 15000),
        jobId: linkedJobId,
        jobTitle: targetTitle,
        jobDescription: targetDescription.slice(0, 10000),
        atsScore: analysisResults.atsScore,
        scoreBreakdown: analysisResults.scoreBreakdown,
        matchedKeywords: analysisResults.matchedKeywords,
        missingKeywords: analysisResults.missingKeywords,
        detectedSkills: analysisResults.detectedSkills,
        requiredSkills: analysisResults.requiredSkills,
        missingSkills: analysisResults.missingSkills,
        sectionAnalysis: analysisResults.sectionAnalysis,
        suggestions: analysisResults.suggestions
      });
    } catch (dbErr) {
      console.warn("Resume DB Save notice:", dbErr.message);
      savedAnalysis = {
        _id: "analysis-" + Date.now(),
        user: req.user?._id || "6a9401084d788adc6a04e900",
        resumeFileName: req.file.originalname || "resume.pdf",
        jobTitle: targetTitle,
        jobDescription: targetDescription,
        atsScore: analysisResults.atsScore,
        scoreBreakdown: analysisResults.scoreBreakdown,
        matchedKeywords: analysisResults.matchedKeywords,
        missingKeywords: analysisResults.missingKeywords,
        detectedSkills: analysisResults.detectedSkills,
        requiredSkills: analysisResults.requiredSkills,
        missingSkills: analysisResults.missingSkills,
        sectionAnalysis: analysisResults.sectionAnalysis,
        suggestions: analysisResults.suggestions,
        createdAt: new Date()
      };
    }

    return res.status(200).json({
      success: true,
      message: "Resume analyzed successfully",
      data: savedAnalysis
    });
  } catch (error) {
    console.error("Analyze Resume Controller Error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to analyze resume"
    });
  }
};

// =========================================================
// @desc    Get user's previous resume analyses
// @route   GET /api/resume/analyses
// @access  Private
// =========================================================
const getAnalyses = async (req, res) => {
  try {
    const analyses = await ResumeAnalysis.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .select("-resumeText -jobDescription");

    return res.status(200).json({
      success: true,
      count: analyses.length,
      data: analyses
    });
  } catch (error) {
    console.error("Get Analyses Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to retrieve resume analyses history"
    });
  }
};

// =========================================================
// @desc    Get single resume analysis by ID
// @route   GET /api/resume/analysis/:id
// @access  Private
// =========================================================
const getAnalysisById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid analysis ID"
      });
    }

    const analysis = await ResumeAnalysis.findById(id);

    if (!analysis) {
      return res.status(404).json({
        success: false,
        message: "Resume analysis not found"
      });
    }

    if (analysis.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to view this analysis"
      });
    }

    return res.status(200).json({
      success: true,
      data: analysis
    });
  } catch (error) {
    console.error("Get Analysis By ID Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch resume analysis details"
    });
  }
};

// =========================================================
// @desc    Delete a resume analysis
// @route   DELETE /api/resume/analysis/:id
// @access  Private
// =========================================================
const deleteAnalysis = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid analysis ID"
      });
    }

    const analysis = await ResumeAnalysis.findById(id);

    if (!analysis) {
      return res.status(404).json({
        success: false,
        message: "Resume analysis not found"
      });
    }

    if (analysis.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to delete this analysis"
      });
    }

    await ResumeAnalysis.findByIdAndDelete(id);

    return res.status(200).json({
      success: true,
      message: "Resume analysis deleted successfully"
    });
  } catch (error) {
    console.error("Delete Analysis Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to delete resume analysis"
    });
  }
};

module.exports = {
  analyzeResume,
  getAnalyses,
  getAnalysisById,
  deleteAnalysis
};
