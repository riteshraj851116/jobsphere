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
        "Under Review",
        "Reviewing",
        "Shortlisted",
        "Interview",
        "Selected",
        "Hired",
        "Rejected"
      ],
      default: "Applied"
    },

    stage: {
      type: String,
      enum: [
        "Saved",
        "Applied",
        "Under Review",
        "Interview",
        "Technical Round",
        "Offer",
        "Rejected"
      ],
      default: "Applied"
    },

    candidateNotes: [
      {
        text: { type: String, trim: true, required: true },
        createdAt: { type: Date, default: Date.now }
      }
    ],

    reminders: [
      {
        title: { type: String, trim: true, required: true },
        dueDate: { type: Date, required: true },
        isCompleted: { type: Boolean, default: false },
        createdAt: { type: Date, default: Date.now }
      }
    ],

    timeline: [
      {
        status: { type: String, required: true },
        note: { type: String, default: "" },
        date: { type: Date, default: Date.now }
      }
    ],

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