const express = require("express");

const {
  applyForJob,
  getMyApplications,
  getApplicationById,
  getJobApplicants,
  updateApplicationStatus,
  withdrawApplication
} = require("../controllers/applicationController");

const { protect } = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");

const router = express.Router();

// ========================================
// Applicant routes
// ========================================

// Apply for a job
router.post(
  "/apply",
  protect,
  authorizeRoles("user"),
  applyForJob
);

// Get all my applications (Root GET /api/applications)
router.get(
  "/",
  protect,
  getMyApplications
);

// Get my applications
router.get(
  "/my-applications",
  protect,
  getMyApplications
);

router.get(
  "/my",
  protect,
  getMyApplications
);

// Get single application
router.get(
  "/:id",
  protect,
  getApplicationById
);

// Withdraw application
router.delete(
  "/:id/withdraw",
  protect,
  authorizeRoles("user"),
  withdrawApplication
);

// ========================================
// Recruiter routes
// ========================================

// Get applicants for a job
router.get(
  "/job/:jobId/applicants",
  protect,
  authorizeRoles("recruiter"),
  getJobApplicants
);

// Update application status
router.put(
  "/:id/status",
  protect,
  authorizeRoles("recruiter"),
  updateApplicationStatus
);

module.exports = router;