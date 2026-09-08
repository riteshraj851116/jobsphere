const mongoose = require("mongoose");

const reportSchema = new mongoose.Schema(
  {
    reporter: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    targetType: {
      type: String,
      enum: ["user", "post", "comment", "message"],
      required: true
    },
    targetId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true
    },
    reason: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200
    },
    details: {
      type: String,
      trim: true,
      maxlength: 1000,
      default: ""
    },
    status: {
      type: String,
      enum: ["pending", "reviewed", "resolved", "dismissed"],
      default: "pending"
    }
  },
  {
    timestamps: true
  }
);

reportSchema.index({
  reporter: 1,
  targetType: 1,
  targetId: 1
});

reportSchema.index({
  status: 1,
  createdAt: -1
});

const Report = mongoose.model("Report", reportSchema);

module.exports = Report;
