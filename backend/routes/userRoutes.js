const express = require("express");

const {
  getMyProfile,
  updateProfile,
  updateSkills,
  addEducation,
  deleteEducation,
  addExperience,
  deleteExperience,
  getUserProfile,
  getUserById,
  searchUsers,
  saveJob,
  getSavedJobs
} = require("../controllers/userController");

const {
  protect
} = require("../middleware/authMiddleware");

const router = express.Router();

/*
=========================================================
CURRENT USER PROFILE
=========================================================
*/

router.get(
  "/me",
  protect,
  getMyProfile
);


/*
=========================================================
UPDATE PROFILE
=========================================================
*/

router.put(
  "/profile",
  protect,
  updateProfile
);


/*
=========================================================
SKILLS
=========================================================
*/

router.put(
  "/skills",
  protect,
  updateSkills
);


/*
=========================================================
EDUCATION
=========================================================
*/

router.post(
  "/education",
  protect,
  addEducation
);

router.delete(
  "/education/:educationId",
  protect,
  deleteEducation
);


/*
=========================================================
EXPERIENCE
=========================================================
*/

router.post(
  "/experience",
  protect,
  addExperience
);

router.delete(
  "/experience/:experienceId",
  protect,
  deleteExperience
);


/*
=========================================================
SEARCH USERS
=========================================================
*/

router.get(
  "/search",
  searchUsers
);

router.get(
  "/id/:id",
  getUserById
);


/*
=========================================================
SAVED JOBS
=========================================================
*/

/*
IMPORTANT:
These routes MUST come before /:username
*/

router.post(
  "/save-job/:jobId",
  protect,
  saveJob
);

router.get(
  "/saved-jobs",
  protect,
  getSavedJobs
);


/*
=========================================================
PUBLIC USER PROFILE
=========================================================
*/

router.get(
  "/:username",
  getUserProfile
);


module.exports = router;