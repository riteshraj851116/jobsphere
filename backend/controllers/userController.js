const User = require("../models/User");
const Job = require("../models/Job");

/*
=========================================================
GET MY PROFILE
=========================================================
*/
const getMyProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .select("-password")
      .populate(
        "connections",
        "name username profilePicture headline"
      )
      .populate(
        "followers",
        "name username profilePicture headline"
      )
      .populate(
        "following",
        "name username profilePicture headline"
      );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User profile not found"
      });
    }

    res.status(200).json({
      success: true,
      message: "Profile fetched successfully",
      data: {
        user
      }
    });
  } catch (error) {
    console.error("Get My Profile Error:", error);

    res.status(500).json({
      success: false,
      message: "Server error while fetching profile"
    });
  }
};


/*
=========================================================
UPDATE PROFILE
=========================================================
*/
const updateProfile = async (req, res) => {
  try {
    const {
      name,
      username,
      headline,
      bio,
      location,
      phone,
      website,
      profilePicture,
      coverPicture,
      resume
    } = req.body;

    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    /*
    Check username availability
    */
    if (
      username &&
      username.toLowerCase() !== user.username
    ) {
      const existingUsername = await User.findOne({
        username: username.toLowerCase(),
        _id: {
          $ne: user._id
        }
      });

      if (existingUsername) {
        return res.status(409).json({
          success: false,
          message: "Username is already taken"
        });
      }

      user.username = username.trim().toLowerCase();
    }

    /*
    Name
    */
    if (name !== undefined) {
      if (name.trim().length < 2) {
        return res.status(400).json({
          success: false,
          message: "Name must be at least 2 characters"
        });
      }

      user.name = name.trim();
    }

    /*
    Other fields
    */
    if (headline !== undefined) {
      user.headline = headline.trim();
    }

    if (bio !== undefined) {
      user.bio = bio.trim();
    }

    if (location !== undefined) {
      user.location = location.trim();
    }

    if (phone !== undefined) {
      user.phone = phone.trim();
    }

    if (website !== undefined) {
      user.website = website.trim();
    }

    if (profilePicture !== undefined) {
      user.profilePicture = profilePicture.trim();
    }

    if (coverPicture !== undefined) {
      user.coverPicture = coverPicture.trim();
    }

    if (resume !== undefined) {
      user.resume = resume.trim();
    }

    await user.save();

    const updatedUser = await User.findById(user._id)
      .select("-password");

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      data: {
        user: updatedUser
      }
    });
  } catch (error) {
    console.error("Update Profile Error:", error);

    res.status(500).json({
      success: false,
      message: "Server error while updating profile"
    });
  }
};


/*
=========================================================
UPDATE SKILLS
=========================================================
*/
const updateSkills = async (req, res) => {
  try {
    const { skills } = req.body;

    if (!Array.isArray(skills)) {
      return res.status(400).json({
        success: false,
        message: "Skills must be an array"
      });
    }

    const cleanedSkills = skills
      .map((skill) => String(skill).trim())
      .filter((skill) => skill.length > 0)
      .filter(
        (skill, index, array) =>
          array.indexOf(skill) === index
      );

    const user = await User.findByIdAndUpdate(
      req.user._id,
      {
        skills: cleanedSkills
      },
      {
        new: true,
        runValidators: true
      }
    ).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    res.status(200).json({
      success: true,
      message: "Skills updated successfully",
      data: {
        skills: user.skills
      }
    });
  } catch (error) {
    console.error("Update Skills Error:", error);

    res.status(500).json({
      success: false,
      message: "Server error while updating skills"
    });
  }
};


/*
=========================================================
ADD EDUCATION
=========================================================
*/
const addEducation = async (req, res) => {
  try {
    const {
      institution,
      degree,
      field,
      startYear,
      endYear,
      description
    } = req.body;

    if (!institution || !degree) {
      return res.status(400).json({
        success: false,
        message: "Institution and degree are required"
      });
    }

    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    user.education.push({
      institution: institution.trim(),
      degree: degree.trim(),
      field: field ? field.trim() : "",
      startYear,
      endYear,
      description: description
        ? description.trim()
        : ""
    });

    await user.save();

    res.status(201).json({
      success: true,
      message: "Education added successfully",
      data: {
        education: user.education
      }
    });
  } catch (error) {
    console.error("Add Education Error:", error);

    res.status(500).json({
      success: false,
      message: "Server error while adding education"
    });
  }
};


/*
=========================================================
DELETE EDUCATION
=========================================================
*/
const deleteEducation = async (req, res) => {
  try {
    const { educationId } = req.params;

    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    const education = user.education.id(educationId);

    if (!education) {
      return res.status(404).json({
        success: false,
        message: "Education entry not found"
      });
    }

    education.deleteOne();

    await user.save();

    res.status(200).json({
      success: true,
      message: "Education deleted successfully",
      data: {
        education: user.education
      }
    });
  } catch (error) {
    console.error("Delete Education Error:", error);

    res.status(500).json({
      success: false,
      message: "Server error while deleting education"
    });
  }
};


/*
=========================================================
ADD EXPERIENCE
=========================================================
*/
const addExperience = async (req, res) => {
  try {
    const {
      company,
      position,
      location,
      description,
      startDate,
      endDate,
      currentlyWorking
    } = req.body;

    if (!company || !position) {
      return res.status(400).json({
        success: false,
        message: "Company and position are required"
      });
    }

    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    user.experience.push({
      company: company.trim(),
      position: position.trim(),
      location: location
        ? location.trim()
        : "",
      description: description
        ? description.trim()
        : "",
      startDate,
      endDate,
      currentlyWorking: Boolean(currentlyWorking)
    });

    await user.save();

    res.status(201).json({
      success: true,
      message: "Experience added successfully",
      data: {
        experience: user.experience
      }
    });
  } catch (error) {
    console.error("Add Experience Error:", error);

    res.status(500).json({
      success: false,
      message: "Server error while adding experience"
    });
  }
};


/*
=========================================================
DELETE EXPERIENCE
=========================================================
*/
const deleteExperience = async (req, res) => {
  try {
    const { experienceId } = req.params;

    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    const experience = user.experience.id(experienceId);

    if (!experience) {
      return res.status(404).json({
        success: false,
        message: "Experience entry not found"
      });
    }

    experience.deleteOne();

    await user.save();

    res.status(200).json({
      success: true,
      message: "Experience deleted successfully",
      data: {
        experience: user.experience
      }
    });
  } catch (error) {
    console.error("Delete Experience Error:", error);

    res.status(500).json({
      success: false,
      message: "Server error while deleting experience"
    });
  }
};


/*
=========================================================
GET USER PROFILE
=========================================================
*/
const getUserProfile = async (req, res) => {
  try {
    const { username } = req.params;

    const user = await User.findOne({
      username: username.toLowerCase()
    })
      .select("-password")
      .populate(
        "connections",
        "name username profilePicture headline"
      )
      .populate(
        "followers",
        "name username profilePicture headline"
      )
      .populate(
        "following",
        "name username profilePicture headline"
      );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User profile not found"
      });
    }

    res.status(200).json({
      success: true,
      message: "User profile fetched successfully",
      data: {
        user
      }
    });
  } catch (error) {
    console.error("Get User Profile Error:", error);

    res.status(500).json({
      success: false,
      message: "Server error while fetching user profile"
    });
  }
};


/*
=========================================================
SEARCH USERS
=========================================================
*/
const searchUsers = async (req, res) => {
  try {
    const {
      search = "",
      page = 1,
      limit = 10
    } = req.query;

    const currentPage = Math.max(
      Number(page) || 1,
      1
    );

    const itemsPerPage = Math.min(
      Math.max(Number(limit) || 10, 1),
      50
    );

    const skip =
      (currentPage - 1) * itemsPerPage;

    const searchRegex = new RegExp(search, "i");

    const filter = search.trim()
      ? {
          $or: [
            { name: searchRegex },
            { username: searchRegex },
            { headline: searchRegex },
            { location: searchRegex },
            { skills: searchRegex }
          ]
        }
      : {};

    const [users, totalUsers] =
      await Promise.all([
        User.find(filter)
          .select(
            "name username profilePicture headline location skills"
          )
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(itemsPerPage),

        User.countDocuments(filter)
      ]);

    res.status(200).json({
      success: true,
      data: {
        users,
        pagination: {
          currentPage,
          totalPages: Math.ceil(
            totalUsers / itemsPerPage
          ),
          totalUsers,
          hasNextPage:
            currentPage * itemsPerPage <
            totalUsers
        }
      }
    });
  } catch (error) {
    console.error("Search Users Error:", error);

    res.status(500).json({
      success: false,
      message: "Server error while searching users"
    });
  }
};


/*
=========================================================
SAVE / UNSAVE JOB
=========================================================
*/
const saveJob = async (req, res) => {
  try {
    const { jobId } = req.params;

    /*
    Validate job ID / job existence
    */
    const job = await Job.findById(jobId);

    if (!job) {
      return res.status(404).json({
        success: false,
        message: "Job not found"
      });
    }

    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    /*
    IMPORTANT:
    Convert ObjectIds to strings before comparing.
    */
    const jobIndex = user.savedJobs.findIndex(
      (savedJobId) =>
        savedJobId.toString() === jobId.toString()
    );

    let isSaved;

    /*
    Job is not saved -> save it
    */
    if (jobIndex === -1) {
      user.savedJobs.push(job._id);
      isSaved = true;
    }

    /*
    Job is already saved -> remove it
    */
    else {
      user.savedJobs.splice(jobIndex, 1);
      isSaved = false;
    }

    await user.save();

    /*
    Return populated saved jobs
    */
    const updatedUser = await User.findById(
      user._id
    ).populate({
      path: "savedJobs",
      populate: {
        path: "company"
      }
    });

    res.status(200).json({
      success: true,
      message: isSaved
        ? "Job saved successfully"
        : "Job removed from saved list",
      data: {
        isSaved,
        savedJobs: updatedUser.savedJobs
      }
    });
  } catch (error) {
    console.error("Save Job Error:", error);

    res.status(500).json({
      success: false,
      message: "Server error while saving job",
      error:
        process.env.NODE_ENV === "development"
          ? error.message
          : undefined
    });
  }
};


/*
=========================================================
GET SAVED JOBS
=========================================================
*/
const getSavedJobs = async (req, res) => {
  try {
    const user = await User.findById(
      req.user._id
    ).populate({
      path: "savedJobs",
      populate: {
        path: "company"
      }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    /*
    Remove null jobs if a job was deleted
    from database but still exists in savedJobs.
    */
    const savedJobs = user.savedJobs.filter(
      Boolean
    );

    /*
    Clean broken references from user document
    */
    if (
      savedJobs.length !== user.savedJobs.length
    ) {
      user.savedJobs = savedJobs.map(
        (job) => job._id
      );

      await user.save();
    }

    res.status(200).json({
      success: true,
      message: "Saved jobs fetched successfully",
      data: {
        savedJobs,
        count: savedJobs.length
      }
    });
  } catch (error) {
    console.error(
      "Get Saved Jobs Error:",
      error
    );

    res.status(500).json({
      success: false,
      message:
        "Server error while fetching saved jobs"
    });
  }
};


/*
=========================================================
EXPORTS
=========================================================
*/
module.exports = {
  getMyProfile,
  updateProfile,
  updateSkills,
  addEducation,
  deleteEducation,
  addExperience,
  deleteExperience,
  getUserProfile,
  searchUsers,
  saveJob,
  getSavedJobs
};