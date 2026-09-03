const mongoose = require("mongoose");

const savedSearchSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    title: {
      type: String,
      required: [true, "Search name is required"],
      trim: true
    },
    query: {
      type: String,
      default: "",
      trim: true
    },
    filters: {
      location: { type: String, default: "" },
      jobType: { type: String, default: "" },
      experience: { type: String, default: "" },
      minSalary: { type: Number },
      remote: { type: Boolean, default: false }
    },
    lastRunAt: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true
  }
);

savedSearchSchema.index({ user: 1, createdAt: -1 });

module.exports = mongoose.model("SavedSearch", savedSearchSchema);
