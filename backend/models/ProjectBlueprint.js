const mongoose = require("mongoose");

const projectBlueprintSchema = new mongoose.Schema(
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
    problemStatement: {
      type: String,
      required: true,
    },
    targetUsers: {
      type: String,
      default: "",
    },
    features: [{ type: String }],
    techStack: [{ type: String }],
    architectureSummary: {
      type: String,
      default: "",
    },
    databaseDesign: {
      type: String,
      default: "",
    },
    apiModules: [{ type: String }],
    authenticationRequirements: {
      type: String,
      default: "",
    },
    milestones: [
      {
        phase: { type: String },
        tasks: [{ type: String }],
        completed: { type: Boolean, default: false },
      },
    ],
    testingStrategy: {
      type: String,
      default: "",
    },
    deploymentPlan: {
      type: String,
      default: "",
    },
    status: {
      type: String,
      enum: ["planned", "in_progress", "completed"],
      default: "planned",
    },
    relevantJobRoles: [{ type: String }],
  },
  {
    timestamps: true,
  }
);

const ProjectBlueprint = mongoose.model("ProjectBlueprint", projectBlueprintSchema);

module.exports = ProjectBlueprint;
