const mongoose = require("mongoose");

const DailyChallengeSchema = new mongoose.Schema(
  {
    date: {
      type: String, // "YYYY-MM-DD"
      required: true,
      unique: true,
      index: true,
    },
    problem: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "DSAProblem",
      required: true,
    },
    estimatedMinutes: {
      type: Number,
      default: 25,
    },
    completedBy: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("DailyChallenge", DailyChallengeSchema);
