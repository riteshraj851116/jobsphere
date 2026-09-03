const mongoose = require("mongoose");

const jobAlertSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    title: {
      type: String,
      required: [true, "Alert title is required"],
      trim: true
    },
    role: {
      type: String,
      trim: true,
      default: ""
    },
    location: {
      type: String,
      trim: true,
      default: ""
    },
    keywords: [
      {
        type: String,
        trim: true
      }
    ],
    jobType: {
      type: String,
      enum: ["Full-time", "Part-time", "Contract", "Internship", "Remote", "Any"],
      default: "Any"
    },
    frequency: {
      type: String,
      enum: ["daily", "weekly"],
      default: "daily"
    },
    isActive: {
      type: Boolean,
      default: true
    },
    lastTriggeredAt: {
      type: Date
    }
  },
  {
    timestamps: true
  }
);

jobAlertSchema.index({ user: 1, createdAt: -1 });

module.exports = mongoose.model("JobAlert", jobAlertSchema);
