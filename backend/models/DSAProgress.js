const mongoose = require("mongoose");

const DSAProgressSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
      index: true,
    },
    solvedProblems: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "DSAProblem",
      },
    ],
    attemptedProblems: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "DSAProblem",
      },
    ],
    streak: {
      currentStreak: { type: Number, default: 0 },
      longestStreak: { type: Number, default: 0 },
      lastActiveDate: { type: String, default: null }, // format: "YYYY-MM-DD"
      activityDates: [{ type: String }], // set of "YYYY-MM-DD" dates
    },
    difficultyStats: {
      easy: { type: Number, default: 0 },
      medium: { type: Number, default: 0 },
      hard: { type: Number, default: 0 },
    },
    topicStats: {
      type: Map,
      of: new mongoose.Schema(
        {
          solved: { type: Number, default: 0 },
          attempted: { type: Number, default: 0 },
          failed: { type: Number, default: 0 },
        },
        { _id: false }
      ),
      default: {},
    },
    totalSubmissions: {
      type: Number,
      default: 0,
    },
    acceptedSubmissions: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("DSAProgress", DSAProgressSchema);
