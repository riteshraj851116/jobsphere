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
  const filetypes = /jpeg|jpg|png|gif|webp|pdf|docx|doc/;
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = filetypes.test(file.mimetype) || file.mimetype.startsWith("image/") || file.mimetype.includes("pdf") || file.mimetype.includes("document");

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error("Images and Documents only!"));
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
