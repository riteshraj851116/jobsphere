const mongoose = require("mongoose");

const skillProofSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    skillName: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      enum: [
        "Frontend",
        "Backend",
        "Database",
        "DevOps",
        "Data Structures",
        "System Design",
        "Programming Language",
        "Tools",
      ],
      default: "Frontend",
    },
    status: {
      type: String,
      enum: ["Unverified", "Practicing", "Assessed", "Verified"],
      default: "Unverified",
    },
    proofType: {
      type: String,
      enum: ["dsa_problem", "interview_assessment", "project_evidence", "technical_quiz", "none"],
      default: "none",
    },
    evidence: {
      score: { type: Number, default: 0 },
      description: { type: String, default: "" },
      referenceId: { type: String, default: "" },
      link: { type: String, default: "" },
      verifiedAt: { type: Date },
    },
    verificationAttempts: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

skillProofSchema.index({ user: 1, skillName: 1 }, { unique: true });

const SkillProof = mongoose.model("SkillProof", skillProofSchema);

module.exports = SkillProof;
