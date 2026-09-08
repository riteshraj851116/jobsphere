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
  getSavedJobs,
  followUser,
  unfollowUser,
  getFollowers,
  getFollowing,
  blockUser,
  unblockUser,
  getBlockedUsers
} = require("../controllers/userController");
const { protect, optionalAuth } = require("../middleware/authMiddleware");

const router = express.Router();

// Base users list / search
router.get("/", searchUsers);
router.get("/search", searchUsers);
router.get("/profile/:username", optionalAuth, getUserProfile);

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

// Blocked users
router.get("/me/blocked", protect, getBlockedUsers);

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
   SOCIAL: FOLLOW / UNFOLLOW
================================== */
router.post("/:id/follow", protect, followUser);
router.delete("/:id/follow", protect, unfollowUser);
router.post("/:id/unfollow", protect, unfollowUser);
router.post("/follow/:id", protect, followUser);
router.delete("/follow/:id", protect, unfollowUser);
router.post("/unfollow/:id", protect, unfollowUser);
router.get("/:id/followers", getFollowers);
router.get("/:id/following", getFollowing);
router.get("/followers/:id", getFollowers);
router.get("/following/:id", getFollowing);

/* ==================================
   SOCIAL: BLOCK / UNBLOCK
================================== */
router.post("/:id/block", protect, blockUser);
router.delete("/:id/block", protect, unblockUser);
router.post("/:id/unblock", protect, unblockUser);

/* ==================================
   DYNAMIC ROUTE (MUST STAY AT BOTTOM)
================================== */
router.get("/id/:id", optionalAuth, getUserById);
router.get("/:id", optionalAuth, getUserById);

module.exports = router;