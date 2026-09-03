const mongoose = require("mongoose");

const roadmapSkillSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    description: {
      type: String,
      default: "",
      trim: true
    },
    priority: {
      type: String,
      enum: ["high", "medium", "optional"],
      default: "high"
    },
    completed: {
      type: Boolean,
      default: false
    },
    completedAt: {
      type: Date
    }
  },
  { _id: true }
);

const roadmapPhaseSchema = new mongoose.Schema(
  {
    phaseNumber: {
      type: Number,
      required: true
    },
    title: {
      type: String,
      required: true,
      trim: true
    },
    description: {
      type: String,
      default: "",
      trim: true
    },
    skills: [roadmapSkillSchema]
  },
  { _id: true }
);

const careerRoadmapSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User is required"]
    },
    targetRole: {
      type: String,
      required: [true, "Target role is required"],
      trim: true
    },
    phases: [roadmapPhaseSchema],
    totalSkills: {
      type: Number,
      default: 0
    },
    completedSkillsCount: {
      type: Number,
      default: 0
    },
    completionPercentage: {
      type: Number,
      default: 0,
      min: 0,
      max: 100
    }
  },
  {
    timestamps: true
  }
);

careerRoadmapSchema.index({ user: 1, targetRole: 1 }, { unique: true });

careerRoadmapSchema.methods.recalculateProgress = function () {
  let total = 0;
  let completed = 0;

  this.phases.forEach((phase) => {
    phase.skills.forEach((skill) => {
      total += 1;
      if (skill.completed) {
        completed += 1;
      }
    });
  });

  this.totalSkills = total;
  this.completedSkillsCount = completed;
  this.completionPercentage = total > 0 ? Math.round((completed / total) * 100) : 0;
};

module.exports = mongoose.model("CareerRoadmap", careerRoadmapSchema);
