const mongoose = require("mongoose");

const jobSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Job title is required"],
      trim: true,
      maxlength: 150
    },

    description: {
      type: String,
      required: [true, "Job description is required"],
      trim: true,
      maxlength: 10000
    },

    responsibilities: [
      {
        type: String,
        trim: true
      }
    ],

    requirements: [
      {
        type: String,
        trim: true
      }
    ],

    skills: [
      {
        type: String,
        trim: true,
        lowercase: true
      }
    ],

    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
      required: true
    },

    recruiter: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    location: {
      type: String,
      required: [true, "Job location is required"],
      trim: true
    },

    isRemote: {
      type: Boolean,
      default: false
    },

    jobType: {
      type: String,
      enum: [
        "Full Time",
        "Part Time",
        "Internship",
        "Contract",
        "Freelance"
      ],
      required: true
    },

    experienceLevel: {
      type: String,
      enum: [
        "Entry Level",
        "Mid Level",
        "Senior Level",
        "Lead"
      ],
      required: true
    },

    category: {
      type: String,
      required: [true, "Job category is required"],
      trim: true
    },

    salaryMin: {
      type: Number,
      min: 0,
      default: 0
    },

    salaryMax: {
      type: Number,
      min: 0,
      default: 0
    },

    openings: {
      type: Number,
      min: 1,
      default: 1
    },

    deadline: {
      type: Date
    },

    status: {
      type: String,
      enum: ["active", "closed", "draft"],
      default: "active"
    },

    views: {
      type: Number,
      default: 0
    }
  },
  {
    timestamps: true
  }
);

jobSchema.index({
  title: "text",
  description: "text",
  skills: "text",
  category: "text",
  location: "text"
});

jobSchema.index({
  createdAt: -1
});

jobSchema.index({
  location: 1,
  jobType: 1,
  experienceLevel: 1
});

const Job = mongoose.model("Job", jobSchema);

module.exports = Job;