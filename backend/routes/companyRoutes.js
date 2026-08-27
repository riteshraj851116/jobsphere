const express = require("express");

const {
  createCompany,
  getCompanies,
  getMyCompanies,
  getCompanyById,
  updateCompany,
  deleteCompany,
  followCompany
} = require("../controllers/companyController");

const { protect } = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");

const router = express.Router();

// Public
router.get("/", getCompanies);

router.get(
  "/mine",
  protect,
  authorizeRoles("recruiter"),
  getMyCompanies
);

router.post(
  "/:id/follow",
  protect,
  followCompany
);

router.get("/:id", getCompanyById);

// Recruiter only
router.post(
  "/",
  protect,
  authorizeRoles("recruiter"),
  createCompany
);

router.put(
  "/:id",
  protect,
  authorizeRoles("recruiter"),
  updateCompany
);

router.delete(
  "/:id",
  protect,
  authorizeRoles("recruiter"),
  deleteCompany
);

module.exports = router;