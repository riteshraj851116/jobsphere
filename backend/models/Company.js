const mongoose = require("mongoose");

const companySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Company name is required"],
      trim: true,
      maxlength: 100
    },

    logo: {
      type: String,
      default: ""
    },

    description: {
      type: String,
      required: [true, "Company description is required"],
      trim: true,
      maxlength: 3000
    },

    website: {
      type: String,
      trim: true,
      default: ""
    },

    industry: {
      type: String,
      trim: true,
      default: ""
    },

    location: {
      type: String,
      trim: true,
      default: ""
    },

    companySize: {
      type: String,
      trim: true,
      default: ""
    },

    foundedYear: {
      type: Number
    },

    recruiter: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    followers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
      }
    ]
  },
  {
    timestamps: true
  }
);

companySchema.index({
  name: "text",
  industry: "text",
  location: "text"
});

const Company = mongoose.model("Company", companySchema);

module.exports = Company;