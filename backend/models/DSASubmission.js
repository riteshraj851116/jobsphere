const mongoose = require("mongoose");

const DSASubmissionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    problem: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "DSAProblem",
      required: true,
      index: true,
    },
    language: {
      type: String,
      required: true,
      enum: ["javascript", "python", "java", "cpp"],
    },
    code: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      required: true,
      enum: [
        "Accepted",
        "Wrong Answer",
        "Time Limit Exceeded",
        "Runtime Error",
        "Compilation Error",
      ],
      index: true,
    },
    runtime: {
      type: Number, // in milliseconds
      default: 0,
    },
    memory: {
      type: Number, // in KB
      default: 0,
    },
    passedCount: {
      type: Number,
      default: 0,
    },
    totalTestCases: {
      type: Number,
      default: 0,
    },
    failedTestCase: {
      input: { type: String, default: "" },
      output: { type: String, default: "" },
      expectedOutput: { type: String, default: "" },
    },
    errorMessage: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

DSASubmissionSchema.index({ user: 1, problem: 1, createdAt: -1 });

module.exports = mongoose.model("DSASubmission", DSASubmissionSchema);
