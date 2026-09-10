const multer = require("multer");
const path = require("path");
const fs = require("fs");
const os = require("os");

let uploadDir = path.join(__dirname, "../uploads");
if (process.env.VERCEL) {
  uploadDir = path.join(os.tmpdir(), "uploads");
}

try {
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }
} catch (e) {
  // Ignore fallback
}

// Set storage engine
const storage = process.env.VERCEL
  ? multer.memoryStorage()
  : multer.diskStorage({
      destination: function (req, file, cb) {
        cb(null, uploadDir);
      },
      filename: function (req, file, cb) {
        cb(null, file.fieldname + "-" + Date.now() + path.extname(file.originalname));
      }
    });

// Check File Type
function checkFileType(file, cb) {
  const allowedExts = /jpeg|jpg|png|gif|webp|svg|avif|pdf|docx|doc/i;
  const ext = path.extname(file.originalname || "").toLowerCase();
  const isExtValid = allowedExts.test(ext);
  const isMimeValid =
    (file.mimetype && file.mimetype.startsWith("image/")) ||
    (file.mimetype && file.mimetype.includes("pdf")) ||
    (file.mimetype && file.mimetype.includes("document"));

  if (isExtValid || isMimeValid || !file.mimetype) {
    return cb(null, true);
  } else {
    return cb(new Error("Please upload a valid image or document format"));
  }
}

// Init upload
const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: function (req, file, cb) {
    checkFileType(file, cb);
  }
});

module.exports = upload;
