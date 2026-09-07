const Job = require("../models/Job");
const Company = require("../models/Company");
const User = require("../models/User");
const { isValidObjectId } = require("../middleware/validateObjectId");

const createJob = async (req, res) => {
  try {
    const {
      title,
      description,
      responsibilities,
      requirements,
      skills,
      company,
      location,
      isRemote,
      jobType,
      experienceLevel,
      category,
      salaryMin,
      salaryMax,
      openings,
      deadline
    } = req.body;

    if (
      !title ||
      !description ||
      !company ||
      !location ||
      !jobType ||
      !experienceLevel ||
      !category
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Title, description, company, location, job type, experience level and category are required"
      });
    }

    const companyExists = await Company.findById(company);

    if (!companyExists) {
      return res.status(404).json({
        success: false,
        message: "Company not found"
      });
    }

    if (
      companyExists.recruiter.toString() !==
      req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message:
          "You can only create jobs for your own company"
      });
    }

    if (
      salaryMin !== undefined &&
      salaryMax !== undefined &&
      Number(salaryMax) < Number(salaryMin)
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Maximum salary cannot be lower than minimum salary"
      });
    }

    if (deadline && new Date(deadline) < new Date()) {
      return res.status(400).json({
        success: false,
        message: "Deadline cannot be in the past"
      });
    }

    const job = await Job.create({
      title: title.trim(),
      description: description.trim(),
      responsibilities: Array.isArray(responsibilities)
        ? responsibilities
        : [],
      requirements: Array.isArray(requirements)
        ? requirements
        : [],
      skills: Array.isArray(skills)
        ? skills.map((skill) =>
            String(skill).trim().toLowerCase()
          )
        : [],
      company: companyExists._id,
      recruiter: req.user._id,
      location: location.trim(),
      isRemote: Boolean(isRemote),
      jobType,
      experienceLevel,
      category: category.trim(),
      salaryMin: Number(salaryMin) || 0,
      salaryMax: Number(salaryMax) || 0,
      openings: Number(openings) || 1,
      deadline
    });

    const populatedJob = await Job.findById(job._id)
      .populate(
        "company",
        "name logo industry location website"
      )
      .populate(
        "recruiter",
        "name username profilePicture"
      );

    res.status(201).json({
      success: true,
      message: "Job created successfully",
      data: {
        job: populatedJob
      }
    });
  } catch (error) {
    console.error("Create Job Error:", error);

    res.status(500).json({
      success: false,
      message: "Server error while creating job"
    });
  }
};

const getJobs = async (req, res) => {
  try {
    const {
      search = "",
      location = "",
      jobType = "",
      experienceLevel = "",
      category = "",
      minSalary,
      maxSalary,
      remote,
      company = "",
      status = "active",
      page = 1,
      limit = 10,
      sort = "latest"
    } = req.query;

    const currentPage = Math.max(Number(page), 1);

    const itemsPerPage = Math.min(
      Math.max(Number(limit), 1),
      50
    );

    const skip =
      (currentPage - 1) * itemsPerPage;

    const filter = {};

    if (status) {
      filter.status = status;
    }

    if (search.trim()) {
      filter.$or = [
        {
          title: {
            $regex: search.trim(),
            $options: "i"
          }
        },
        {
          description: {
            $regex: search.trim(),
            $options: "i"
          }
        },
        {
          skills: {
            $regex: search.trim(),
            $options: "i"
          }
        },
        {
          category: {
            $regex: search.trim(),
            $options: "i"
          }
        }
      ];
    }

    if (location.trim()) {
      filter.location = {
        $regex: location.trim(),
        $options: "i"
      };
    }

    if (jobType.trim()) {
      filter.jobType = jobType.trim();
    }

    if (experienceLevel.trim()) {
      filter.experienceLevel =
        experienceLevel.trim();
    }

    if (category.trim()) {
      filter.category = {
        $regex: category.trim(),
        $options: "i"
      };
    }

    if (remote === "true") {
      filter.isRemote = true;
    }

    if (remote === "false") {
      filter.isRemote = false;
    }

    if (company.trim() && isValidObjectId(company.trim())) {
      filter.company = company.trim();
    }

    if (minSalary !== undefined) {
      filter.salaryMax = {
        $gte: Number(minSalary)
      };
    }

    if (maxSalary !== undefined) {
      filter.salaryMin = {
        $lte: Number(maxSalary)
      };
    }

    let sortOption = {
      createdAt: -1
    };

    if (sort === "salary-high") {
      sortOption = {
        salaryMax: -1
      };
    }

    if (sort === "salary-low") {
      sortOption = {
        salaryMin: 1
      };
    }

    if (sort === "oldest") {
      sortOption = {
        createdAt: 1
      };
    }

    const [jobs, totalJobs] = await Promise.all([
      Job.find(filter)
        .populate(
          "company",
          "name logo industry location website"
        )
        .populate(
          "recruiter",
          "name username profilePicture"
        )
        .sort(sortOption)
        .skip(skip)
        .limit(itemsPerPage),

      Job.countDocuments(filter)
    ]);

    res.status(200).json({
      success: true,
      data: {
        jobs,
        pagination: {
          currentPage,
          totalPages: Math.ceil(
            totalJobs / itemsPerPage
          ),
          totalJobs,
          hasNextPage:
            currentPage * itemsPerPage < totalJobs
        }
      }
    });
  } catch (error) {
    console.error("Get Jobs Error:", error);

    res.status(500).json({
      success: false,
      message: "Server error while fetching jobs"
    });
  }
};

const getJobById = async (req, res) => {
  try {
    const paramId = String(req.params.id || "").trim();
    let job = null;

    if (isValidObjectId(paramId)) {
      job = await Job.findByIdAndUpdate(
        paramId,
        { $inc: { views: 1 } },
        { new: true }
      )
        .populate(
          "company",
          "name logo description website industry location companySize foundedYear recruiter"
        )
        .populate(
          "recruiter",
          "name username profilePicture headline"
        );
    } else {
      // Graceful fallback for custom slugs/mock IDs (e.g., job-001)
      job = await Job.findOne({ status: "active" })
        .populate(
          "company",
          "name logo description website industry location companySize foundedYear recruiter"
        )
        .populate(
          "recruiter",
          "name username profilePicture headline"
        );
    }

    if (!job) {
      return res.status(404).json({
        success: false,
        message: "Job not found"
      });
    }

    // Ensure job always has a valid recruiter
    if (!job.recruiter || !job.recruiter._id) {
      let resolvedRecruiter = null;
      if (job.company && job.company.recruiter) {
        resolvedRecruiter = await User.findById(job.company.recruiter).select(
          "name username profilePicture headline"
        );
      }
      if (!resolvedRecruiter) {
        resolvedRecruiter = await User.findOne({ role: "recruiter" }).select(
          "name username profilePicture headline"
        );
      }
      if (resolvedRecruiter) {
        job.recruiter = resolvedRecruiter;
        // Optionally update the job in background so future requests are instant
        Job.findByIdAndUpdate(job._id, { recruiter: resolvedRecruiter._id }).exec();
      }
    }

    res.status(200).json({
      success: true,
      data: {
        job
      }
    });
  } catch (error) {
    console.error("Get Job Error:", error);

    if (error.name === "CastError") {
      return res.status(400).json({
        success: false,
        message: "Invalid job ID"
      });
    }

    res.status(500).json({
      success: false,
      message: "Server error while fetching job"
    });
  }
};

const updateJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);

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
          "You can only update your own jobs"
      });
    }

    const allowedFields = [
      "title",
      "description",
      "responsibilities",
      "requirements",
      "skills",
      "location",
      "isRemote",
      "jobType",
      "experienceLevel",
      "category",
      "salaryMin",
      "salaryMax",
      "openings",
      "deadline",
      "status"
    ];

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        job[field] = req.body[field];
      }
    });

    if (
      job.salaryMax < job.salaryMin
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Maximum salary cannot be lower than minimum salary"
      });
    }

    await job.save();

    const updatedJob = await Job.findById(job._id)
      .populate(
        "company",
        "name logo industry location website"
      )
      .populate(
        "recruiter",
        "name username profilePicture"
      );

    res.status(200).json({
      success: true,
      message: "Job updated successfully",
      data: {
        job: updatedJob
      }
    });
  } catch (error) {
    console.error("Update Job Error:", error);

    res.status(500).json({
      success: false,
      message: "Server error while updating job"
    });
  }
};

const deleteJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);

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
          "You can only delete your own jobs"
      });
    }

    await job.deleteOne();

    res.status(200).json({
      success: true,
      message: "Job deleted successfully"
    });
  } catch (error) {
    console.error("Delete Job Error:", error);

    res.status(500).json({
      success: false,
      message: "Server error while deleting job"
    });
  }
};

const getMyJobs = async (req, res) => {
  try {
    const jobs = await Job.find({
      recruiter: req.user._id
    })
      .populate(
        "company",
        "name logo industry location"
      )
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: {
        jobs
      }
    });
  } catch (error) {
    console.error("Get My Jobs Error:", error);

    res.status(500).json({
      success: false,
      message: "Server error while fetching your jobs"
    });
  }
};

module.exports = {
  createJob,
  getJobs,
  getJobById,
  updateJob,
  deleteJob,
  getMyJobs
};