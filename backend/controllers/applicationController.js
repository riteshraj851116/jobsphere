const Application = require("../models/Application");
const Job = require("../models/Job");

const applyForJob = async (req, res) => {
  try {
    const {
      jobId,
      coverLetter,
      resume
    } = req.body;

    if (!jobId) {
      return res.status(400).json({
        success: false,
        message: "Job ID is required"
      });
    }

    const job = await Job.findById(jobId);

    if (!job) {
      return res.status(404).json({
        success: false,
        message: "Job not found"
      });
    }

    if (job.status !== "active") {
      return res.status(400).json({
        success: false,
        message: "This job is no longer accepting applications"
      });
    }

    if (
      job.deadline &&
      new Date(job.deadline) < new Date()
    ) {
      return res.status(400).json({
        success: false,
        message: "Application deadline has passed"
      });
    }

    // Recruiter cannot apply to their own job
    if (
      job.recruiter.toString() ===
      req.user._id.toString()
    ) {
      return res.status(400).json({
        success: false,
        message: "You cannot apply to your own job"
      });
    }

    const existingApplication =
      await Application.findOne({
        job: job._id,
        applicant: req.user._id
      });

    if (existingApplication) {
      return res.status(409).json({
        success: false,
        message: "You have already applied for this job"
      });
    }

    const application = await Application.create({
      job: job._id,
      applicant: req.user._id,
      recruiter: job.recruiter,
      company: job.company,
      resume: resume
        ? resume.trim()
        : req.user.resume || "",
      coverLetter: coverLetter
        ? coverLetter.trim()
        : ""
    });

    const populatedApplication =
      await Application.findById(application._id)
        .populate(
          "job",
          "title location jobType experienceLevel salaryMin salaryMax"
        )
        .populate(
          "company",
          "name logo location industry"
        )
        .populate(
          "applicant",
          "name username email profilePicture headline location skills resume"
        )
        .populate(
          "recruiter",
          "name username email profilePicture"
        );

    res.status(201).json({
      success: true,
      message: "Application submitted successfully",
      data: {
        application: populatedApplication
      }
    });
  } catch (error) {
    console.error("Apply Job Error:", error);

    // Duplicate application protection
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "You have already applied for this job"
      });
    }

    res.status(500).json({
      success: false,
      message: "Server error while applying for job"
    });
  }
};

const getMyApplications = async (req, res) => {
  try {
    const {
      status,
      page = 1,
      limit = 10
    } = req.query;

    const currentPage = Math.max(Number(page), 1);

    const itemsPerPage = Math.min(
      Math.max(Number(limit), 1),
      50
    );

    const skip =
      (currentPage - 1) * itemsPerPage;

    const filter = {
      applicant: req.user._id
    };

    if (status) {
      filter.status = status;
    }

    const [
      applications,
      totalApplications
    ] = await Promise.all([
      Application.find(filter)
        .populate(
          "job",
          "title location jobType experienceLevel salaryMin salaryMax status deadline createdAt"
        )
        .populate(
          "company",
          "name logo industry location"
        )
        .populate(
          "recruiter",
          "name username profilePicture"
        )
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(itemsPerPage),

      Application.countDocuments(filter)
    ]);

    res.status(200).json({
      success: true,
      data: {
        applications,
        pagination: {
          currentPage,
          totalPages: Math.ceil(
            totalApplications / itemsPerPage
          ),
          totalApplications,
          hasNextPage:
            currentPage * itemsPerPage <
            totalApplications
        }
      }
    });
  } catch (error) {
    console.error(
      "Get My Applications Error:",
      error
    );

    res.status(500).json({
      success: false,
      message:
        "Server error while fetching applications"
    });
  }
};

const getApplicationById = async (req, res) => {
  try {
    const application =
      await Application.findById(req.params.id)
        .populate(
          "job",
          "title description location jobType experienceLevel category salaryMin salaryMax"
        )
        .populate(
          "company",
          "name logo description website industry location"
        )
        .populate(
          "applicant",
          "name username email profilePicture headline location skills resume"
        )
        .populate(
          "recruiter",
          "name username email profilePicture"
        );

    if (!application) {
      return res.status(404).json({
        success: false,
        message: "Application not found"
      });
    }

    const isApplicant =
      application.applicant._id.toString() ===
      req.user._id.toString();

    const isRecruiter =
      application.recruiter._id.toString() ===
      req.user._id.toString();

    if (!isApplicant && !isRecruiter) {
      return res.status(403).json({
        success: false,
        message:
          "You do not have permission to view this application"
      });
    }

    res.status(200).json({
      success: true,
      data: {
        application
      }
    });
  } catch (error) {
    console.error(
      "Get Application Error:",
      error
    );

    res.status(500).json({
      success: false,
      message:
        "Server error while fetching application"
    });
  }
};

const getJobApplicants = async (req, res) => {
  try {
    const { jobId } = req.params;

    const job = await Job.findById(jobId);

    if (!job) {
      return res.status(404).json({
        success: false,
        message: "Job not found"
      });
    }

    if (
      job.recruiter.toString() !==
      req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message:
          "You can only view applicants for your own jobs"
      });
    }

    const {
      status,
      page = 1,
      limit = 20
    } = req.query;

    const currentPage = Math.max(Number(page), 1);

    const itemsPerPage = Math.min(
      Math.max(Number(limit), 1),
      50
    );

    const skip =
      (currentPage - 1) * itemsPerPage;

    const filter = {
      job: job._id
    };

    if (status) {
      filter.status = status;
    }

    const [
      applications,
      totalApplications
    ] = await Promise.all([
      Application.find(filter)
        .populate(
          "applicant",
          "name username email profilePicture headline location skills resume education experience"
        )
        .populate(
          "job",
          "title location jobType"
        )
        .populate(
          "company",
          "name logo"
        )
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(itemsPerPage),

      Application.countDocuments(filter)
    ]);

    res.status(200).json({
      success: true,
      data: {
        applications,
        pagination: {
          currentPage,
          totalPages: Math.ceil(
            totalApplications / itemsPerPage
          ),
          totalApplications,
          hasNextPage:
            currentPage * itemsPerPage <
            totalApplications
        }
      }
    });
  } catch (error) {
    console.error(
      "Get Job Applicants Error:",
      error
    );

    res.status(500).json({
      success: false,
      message:
        "Server error while fetching applicants"
    });
  }
};

const updateApplicationStatus = async (
  req,
  res
) => {
  try {
    const {
      status,
      recruiterNote
    } = req.body;

    const allowedStatuses = [
      "Applied",
      "Reviewing",
      "Shortlisted",
      "Interview",
      "Hired",
      "Rejected"
    ];

    if (!status) {
      return res.status(400).json({
        success: false,
        message: "Status is required"
      });
    }

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid application status"
      });
    }

    const application =
      await Application.findById(req.params.id);

    if (!application) {
      return res.status(404).json({
        success: false,
        message: "Application not found"
      });
    }

    if (
      application.recruiter.toString() !==
      req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message:
          "Only the recruiter can update application status"
      });
    }

    application.status = status;

    if (recruiterNote !== undefined) {
      application.recruiterNote =
        recruiterNote.trim();
    }

    application.reviewedAt = new Date();

    await application.save();

    const updatedApplication =
      await Application.findById(application._id)
        .populate(
          "job",
          "title location jobType"
        )
        .populate(
          "company",
          "name logo"
        )
        .populate(
          "applicant",
          "name username email profilePicture headline"
        );

    res.status(200).json({
      success: true,
      message:
        "Application status updated successfully",
      data: {
        application: updatedApplication
      }
    });
  } catch (error) {
    console.error(
      "Update Application Status Error:",
      error
    );

    res.status(500).json({
      success: false,
      message:
        "Server error while updating application"
    });
  }
};

const withdrawApplication = async (
  req,
  res
) => {
  try {
    const application =
      await Application.findById(req.params.id);

    if (!application) {
      return res.status(404).json({
        success: false,
        message: "Application not found"
      });
    }

    if (
      application.applicant.toString() !==
      req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message:
          "You can only withdraw your own application"
      });
    }

    if (
      ["Hired", "Rejected"].includes(
        application.status
      )
    ) {
      return res.status(400).json({
        success: false,
        message:
          "This application cannot be withdrawn"
      });
    }

    await application.deleteOne();

    res.status(200).json({
      success: true,
      message:
        "Application withdrawn successfully"
    });
  } catch (error) {
    console.error(
      "Withdraw Application Error:",
      error
    );

    res.status(500).json({
      success: false,
      message:
        "Server error while withdrawing application"
    });
  }
};

module.exports = {
  applyForJob,
  getMyApplications,
  getApplicationById,
  getJobApplicants,
  updateApplicationStatus,
  withdrawApplication
};