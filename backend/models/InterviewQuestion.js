const mongoose = require("mongoose");

const interviewQuestionSchema = new mongoose.Schema(
  {
    question: {
      type: String,
      required: [true, "Question text is required"],
      trim: true
    },
    category: {
      type: String,
      required: [true, "Question category is required"],
      trim: true
    },
    role: {
      type: String,
      required: [true, "Target role is required"],
      trim: true
    },
    difficulty: {
      type: String,
      required: [true, "Difficulty level is required"],
      enum: ["easy", "medium", "hard"],
      lowercase: true,
      trim: true
    },
    type: {
      type: String,
      enum: ["technical", "hr", "behavioral"],
      default: "technical",
      lowercase: true,
      trim: true
    },
    tags: [
      {
        type: String,
        trim: true,
        lowercase: true
      }
    ],
    expectedAnswer: {
      type: String,
      trim: true
    },
    explanation: {
      type: String,
      trim: true
    }
  },
  {
    timestamps: true
  }
);

interviewQuestionSchema.index({ role: 1, difficulty: 1 });
interviewQuestionSchema.index({ category: 1 });

module.exports = mongoose.model("InterviewQuestion", interviewQuestionSchema);
