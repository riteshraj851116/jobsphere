const mongoose = require("mongoose");

const applicationSchema = new mongoose.Schema(
  {
    job: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Job",
      required: true
    },

    applicant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    recruiter: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
      required: true
    },

    resume: {
      type: String,
      default: ""
    },

    coverLetter: {
      type: String,
      trim: true,
      maxlength: 3000,
      default: ""
    },

    status: {
      type: String,
      enum: [
        "Applied",
        "Reviewing",
        "Shortlisted",
        "Interview",
        "Hired",
        "Rejected"
      ],
      default: "Applied"
    },

    recruiterNote: {
      type: String,
      trim: true,
      maxlength: 2000,
      default: ""
    },

    appliedAt: {
      type: Date,
      default: Date.now
    },

    reviewedAt: {
      type: Date
    }
  },
  {
    timestamps: true
  }
);

// One user can apply to a particular job only once
applicationSchema.index(
  {
    job: 1,
    applicant: 1
  },
  {
    unique: true
  }
);

applicationSchema.index({
  recruiter: 1,
  status: 1
});

applicationSchema.index({
  applicant: 1,
  createdAt: -1
});

const Application = mongoose.model(
  "Application",
  applicationSchema
);

module.exports = Application;