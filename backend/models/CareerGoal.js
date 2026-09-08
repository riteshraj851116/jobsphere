const mongoose = require("mongoose");

const milestoneSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      enum: ["skill", "project", "dsa", "interview", "job"],
      default: "skill",
    },
    status: {
      type: String,
      enum: ["pending", "in_progress", "completed"],
      default: "pending",
    },
    explanation: {
      type: String,
      default: "",
    },
    targetActionLink: {
      type: String,
      default: "",
    },
    completedAt: {
      type: Date,
    },
  },
  { _id: true }
);

const careerGoalSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    targetRole: {
      type: String,
      required: true,
      trim: true,
    },
    targetDate: {
      type: Date,
    },
    priority: {
      type: String,
      enum: ["high", "medium", "low"],
      default: "high",
    },
    status: {
      type: String,
      enum: ["active", "paused", "completed"],
      default: "active",
    },
    overallProgress: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    milestones: [milestoneSchema],
    strategyOverview: {
      type: String,
      default: "",
    },
    whyRecommended: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

careerGoalSchema.methods.recalculateProgress = function () {
  if (!this.milestones || this.milestones.length === 0) {
    this.overallProgress = 0;
    return;
  }
  const completed = this.milestones.filter((m) => m.status === "completed").length;
  this.overallProgress = Math.round((completed / this.milestones.length) * 100);
  if (this.overallProgress === 100 && this.status === "active") {
    this.status = "completed";
  }
};

const CareerGoal = mongoose.model("CareerGoal", careerGoalSchema);

module.exports = CareerGoal;
