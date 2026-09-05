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
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

// Base users list / search
router.get("/", searchUsers);
router.get("/search", searchUsers);
router.get("/profile/:username", getUserProfile);

/* ==================================
   CURRENT LOGGED-IN USER (/me & /profile)
================================== */
// Profile retrieval (with backward compatibility)
router.get("/me", protect, getMyProfile);
router.get("/me/profile", protect, getMyProfile);
router.get("/profile", protect, getMyProfile);

// Profile updates (with backward compatibility)
router.put("/me", protect, updateProfile);
router.put("/me/profile", protect, updateProfile);
router.put("/profile", protect, updateProfile);

// Skills
router.put("/me/skills", protect, updateSkills);

/* ==================================
   EDUCATION
================================== */
router.post("/me/education", protect, addEducation);
router.delete("/me/education/:educationId", protect, deleteEducation);

/* ==================================
   EXPERIENCE
================================== */
router.post("/me/experience", protect, addExperience);
router.delete("/me/experience/:experienceId", protect, deleteExperience);

/* ==================================
   SAVED JOBS
================================== */
router.get("/saved-jobs", protect, getSavedJobs);
router.post("/saved-jobs/:jobId", protect, saveJob);
router.delete("/saved-jobs/:jobId", protect, saveJob);
router.post("/save-job/:jobId", protect, saveJob);

/* ==================================
   DYNAMIC ROUTE (MUST STAY AT BOTTOM)
================================== */
router.get("/:id", getUserById);

module.exports = router;