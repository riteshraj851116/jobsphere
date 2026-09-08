const mongoose = require("mongoose");

const DSAProblemSchema = new mongoose.Schema(
  {
    problemNumber: {
      type: Number,
      required: true,
      unique: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      index: true,
      lowercase: true,
      trim: true,
    },
    difficulty: {
      type: String,
      required: true,
      enum: ["Easy", "Medium", "Hard"],
      index: true,
    },
    topics: {
      type: [String],
      required: true,
      index: true,
    },
    sheetCategory: {
      type: String,
      enum: ["Beginner", "Intermediate", "Advanced"],
      default: "Beginner",
      index: true,
    },
    description: {
      type: String,
      required: true,
    },
    examples: [
      {
        input: { type: String, required: true },
        output: { type: String, required: true },
        explanation: { type: String, default: "" },
      },
    ],
    constraints: {
      type: [String],
      default: [],
    },
    followUp: {
      type: String,
      default: "",
    },
    functionName: {
      type: String,
      required: true,
      default: "solution",
    },
    parameters: [
      {
        name: { type: String, required: true },
        type: { type: String, required: true }, // e.g. "number[]", "string", "number"
      },
    ],
    returnType: {
      type: String,
      default: "any",
    },
    starterCode: {
      javascript: { type: String, required: true },
      python: { type: String, required: true },
      java: { type: String, required: true },
      cpp: { type: String, required: true },
    },
    // Visible sample test cases returned to frontend
    sampleTestCases: [
      {
        input: { type: String, required: true },
        expectedOutput: { type: String, required: true },
        explanation: { type: String, default: "" },
      },
    ],
    // Hidden test cases NEVER exposed to the frontend (select: false by default)
    hiddenTestCases: {
      type: [
        {
          input: { type: String, required: true },
          expectedOutput: { type: String, required: true },
        },
      ],
      select: false,
    },
    totalSubmissions: {
      type: Number,
      default: 0,
    },
    totalAccepted: {
      type: Number,
      default: 0,
    },
    order: {
      type: Number,
      default: 0,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Virtual for acceptance rate
DSAProblemSchema.virtual("acceptanceRate").get(function () {
  if (!this.totalSubmissions || this.totalSubmissions === 0) return 0;
  return Math.round((this.totalAccepted / this.totalSubmissions) * 100);
});

DSAProblemSchema.set("toJSON", { virtuals: true });
DSAProblemSchema.set("toObject", { virtuals: true });

module.exports = mongoose.model("DSAProblem", DSAProblemSchema);
