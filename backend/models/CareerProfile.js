const mongoose = require("mongoose");

const careerProfileSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User is required"],
      unique: true,
      index: true,
    },
    targetRole: {
      type: String,
      trim: true,
      default: "Full Stack Developer",
    },
    currentRole: {
      type: String,
      trim: true,
      default: "Aspiring Software Engineer",
    },
    experienceLevel: {
      type: String,
      enum: ["Beginner", "Junior", "Mid-Level", "Senior"],
      default: "Junior",
    },
    // Calculated Derived Metrics (0 - 100)
    careerScore: {
      type: Number,
      default: 65,
      min: 0,
      max: 100,
    },
    jobReadiness: {
      type: Number,
      default: 60,
      min: 0,
      max: 100,
    },
    interviewReadiness: {
      type: Number,
      default: 50,
      min: 0,
      max: 100,
    },
    dsaReadiness: {
      type: Number,
      default: 40,
      min: 0,
      max: 100,
    },
    projectStrength: {
      type: Number,
      default: 65,
      min: 0,
      max: 100,
    },
    resumeStrength: {
      type: Number,
      default: 55,
      min: 0,
      max: 100,
    },
    // Skill Categorization
    strongSkills: [
      {
        type: String,
        trim: true,
      },
    ],
    weakSkills: [
      {
        type: String,
        trim: true,
      },
    ],
    missingSkills: [
      {
        type: String,
        trim: true,
      },
    ],
    recommendedSkills: [
      {
        skill: { type: String, trim: true },
        reason: { type: String, trim: true },
        priority: { type: String, enum: ["High", "Medium", "Low"], default: "Medium" },
      },
    ],
    // Persistent Career Memory
    careerMemory: {
      preferredTechnologies: [{ type: String, trim: true }],
      weakDsaTopics: [{ type: String, trim: true }],
      interviewWeakAreas: [{ type: String, trim: true }],
      careerInterests: [{ type: String, trim: true }],
      lastActiveDate: { type: Date, default: Date.now },
      notes: { type: String, default: "" },
    },
    // Privacy settings for Talent Marketplace
    privacy: {
      isPublicInTalentMarketplace: {
        type: Boolean,
        default: true,
      },
      allowRecruiterContact: {
        type: Boolean,
        default: true,
      },
      openToOpportunities: {
        type: Boolean,
        default: true,
      },
    },
  },
  {
    timestamps: true,
  }
);

const CareerProfile = mongoose.model("CareerProfile", careerProfileSchema);

module.exports = CareerProfile;
