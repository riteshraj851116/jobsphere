const mongoose = require("mongoose");

const answerSchema = new mongoose.Schema(
  {
    questionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "InterviewQuestion",
      required: true
    },
    answer: {
      type: String,
      default: "",
      trim: true
    },
    skipped: {
      type: Boolean,
      default: false
    },
    answeredAt: {
      type: Date,
      default: Date.now
    }
  },
  { _id: false }
);

const interviewSessionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false
    },
    role: {
      type: String,
      required: [true, "Role is required"],
      trim: true
    },
    difficulty: {
      type: String,
      required: [true, "Difficulty level is required"],
      enum: ["easy", "medium", "hard"],
      lowercase: true,
      trim: true
    },
    totalQuestions: {
      type: Number,
      required: [true, "Total questions count is required"],
      min: 1
    },
    questions: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "InterviewQuestion"
      }
    ],
    answers: [answerSchema],
    startedAt: {
      type: Date,
      default: Date.now
    },
    completedAt: {
      type: Date
    },
    duration: {
      type: Number, // Duration in seconds
      default: 0
    },
    status: {
      type: String,
      enum: ["in_progress", "completed"],
      default: "in_progress",
      lowercase: true,
      trim: true
    },
    score: {
      type: Number,
      default: 0
    },
    feedback: {
      type: String,
      default: ""
    },
    strengths: [{
      type: String
    }],
    improvements: [{
      type: String
    }]
  },
  {
    timestamps: true
  }
);

interviewSessionSchema.index({ user: 1, createdAt: -1 });

module.exports = mongoose.model("InterviewSession", interviewSessionSchema);
