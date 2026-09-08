const mongoose = require("mongoose");

const DSABookmarkSchema = new mongoose.Schema(
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
  },
  {
    timestamps: true,
  }
);

// Prevent duplicate bookmarks for the same user and problem
DSABookmarkSchema.index({ user: 1, problem: 1 }, { unique: true });

module.exports = mongoose.model("DSABookmark", DSABookmarkSchema);
