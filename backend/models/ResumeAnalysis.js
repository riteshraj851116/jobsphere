const mongoose = require("mongoose");

const resumeAnalysisSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User reference is required"]
    },
    resumeFileName: {
      type: String,
      required: [true, "Resume file name is required"],
      trim: true
    },
    resumeText: {
      type: String,
      required: [true, "Extracted resume text is required"]
    },
    jobId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Job"
    },
    jobTitle: {
      type: String,
      default: "Custom Job Description",
      trim: true
    },
    jobDescription: {
      type: String,
      required: [true, "Job description is required"]
    },
    atsScore: {
      type: Number,
      required: true,
      min: 0,
      max: 100
    },
    scoreBreakdown: {
      keywordMatch: { type: Number, default: 0 }, // max 35
      skillsMatch: { type: Number, default: 0 }, // max 25
      experienceRelevance: { type: Number, default: 0 }, // max 20
      resumeStructure: { type: Number, default: 0 }, // max 10
      atsReadability: { type: Number, default: 0 }, // max 10
      total: { type: Number, default: 0 }
    },
    matchedKeywords: [
      {
        type: String,
        trim: true
      }
    ],
    missingKeywords: [
      {
        type: String,
        trim: true
      }
    ],
    detectedSkills: [
      {
        type: String,
        trim: true
      }
    ],
    requiredSkills: [
      {
        type: String,
        trim: true
      }
    ],
    missingSkills: [
      {
        type: String,
        trim: true
      }
    ],
    sectionAnalysis: {
      contactInfo: { type: Boolean, default: false },
      summary: { type: Boolean, default: false },
      skills: { type: Boolean, default: false },
      experience: { type: Boolean, default: false },
      education: { type: Boolean, default: false },
      projects: { type: Boolean, default: false }
    },
    suggestions: [
      {
        type: String,
        trim: true
      }
    ]
  },
  {
    timestamps: true
  }
);

resumeAnalysisSchema.index({ user: 1, createdAt: -1 });

module.exports = mongoose.model("ResumeAnalysis", resumeAnalysisSchema);
