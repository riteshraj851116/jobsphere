const mongoose = require("mongoose");

const interviewBookmarkSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    question: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "InterviewQuestion",
      required: true
    },
    notes: {
      type: String,
      default: "",
      trim: true
    },
    tags: [
      {
        type: String,
        trim: true
      }
    ]
  },
  {
    timestamps: true
  }
);

interviewBookmarkSchema.index({ user: 1, question: 1 }, { unique: true });
interviewBookmarkSchema.index({ user: 1, createdAt: -1 });

module.exports = mongoose.model("InterviewBookmark", interviewBookmarkSchema);
