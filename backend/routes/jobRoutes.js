const express = require("express");

const {
  createJob,
  getJobs,
  getJobById,
  updateJob,
  deleteJob,
  getMyJobs
} = require("../controllers/jobController");

const { protect } = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");

const router = express.Router();

// ===============================
// Public job routes
// ===============================

// Get all jobs / search / filter
router.get("/", getJobs);

// ===============================
// Recruiter routes
// ===============================

// Get recruiter's own jobs
// IMPORTANT: This must come before /:id
router.get(
  "/recruiter/my-jobs",
  protect,
  authorizeRoles("recruiter"),
  getMyJobs
);

// Create job
router.post(
  "/",
  protect,
  authorizeRoles("recruiter"),
  createJob
);

// Update job
router.put(
  "/:id",
  protect,
  authorizeRoles("recruiter"),
  updateJob
);

// Delete job
router.delete(
  "/:id",
  protect,
  authorizeRoles("recruiter"),
  deleteJob
);

// ===============================
// Get single job
// ===============================

router.get("/:id", getJobById);

module.exports = router;