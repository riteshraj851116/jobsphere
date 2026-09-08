const mongoose = require("mongoose");

const revisionTopicSchema = new mongoose.Schema(
  {
    topic: { type: String, required: true },
    question: { type: String, required: true },
    answer: { type: String, required: true },
    keyPoints: [{ type: String }],
    difficulty: { type: String, enum: ["Easy", "Medium", "Hard"], default: "Medium" },
    completed: { type: Boolean, default: false },
    completedAt: { type: Date },
  },
  { _id: true }
);

const revisionSessionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    category: {
      type: String,
      enum: [
        "Concepts",
        "DSA",
        "JavaScript",
        "React",
        "Node.js",
        "MongoDB",
        "System Design",
        "Interview Questions",
      ],
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    topics: [revisionTopicSchema],
    progressPercentage: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
  },
  {
    timestamps: true,
  }
);

revisionSessionSchema.methods.recalculate = function () {
  if (!this.topics || this.topics.length === 0) {
    this.progressPercentage = 0;
    return;
  }
  const completed = this.topics.filter((t) => t.completed).length;
  this.progressPercentage = Math.round((completed / this.topics.length) * 100);
};

const RevisionSession = mongoose.model("RevisionSession", revisionSessionSchema);

module.exports = RevisionSession;
