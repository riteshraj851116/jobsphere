const express = require("express");
const multer = require("multer");
const path = require("path");
const {
  analyzeResume,
  getAnalyses,
  getAnalysisById,
  deleteAnalysis
} = require("../controllers/resumeController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

// Configure Multer for In-Memory resume upload
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const allowedExtensions = [".pdf", ".docx", ".doc"];
  const ext = path.extname(file.originalname).toLowerCase();

  const allowedMimeTypes = [
    "application/pdf",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/msword",
    "application/octet-stream"
  ];

  if (allowedExtensions.includes(ext) || allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Only PDF and DOCX documents are supported."), false);
  }
};

const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter
});

// All resume routes require authentication
router.use(protect);

// Upload and analyze resume
router.post("/analyze", upload.single("resume"), analyzeResume);

// Get user's previous analyses
router.get("/analyses", getAnalyses);

// Get specific analysis by ID
router.get("/analysis/:id", getAnalysisById);

// Delete analysis
router.delete("/analysis/:id", deleteAnalysis);

module.exports = router;
