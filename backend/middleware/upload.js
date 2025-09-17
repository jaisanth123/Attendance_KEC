const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Ensure uploads directory exists
const uploadsDir = "uploads";
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    // Create a more descriptive filename
    const timestamp = Date.now();
    const originalName = path.parse(file.originalname).name;
    const extension = path.extname(file.originalname);
    cb(null, `${originalName}_${timestamp}${extension}`);
  },
});

const fileFilter = (req, file, cb) => {
  // Check if file is CSV
  if (
    file.mimetype === "text/csv" ||
    file.originalname.toLowerCase().endsWith(".csv") ||
    file.mimetype === "application/vnd.ms-excel"
  ) {
    cb(null, true);
  } else {
    const error = new Error("Only CSV files are allowed!");
    error.code = "INVALID_FILE_TYPE";
    cb(error, false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
    files: 1, // Only allow one file at a time
  },
});

// Error handling middleware for multer
const handleUploadError = (error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({
        success: false,
        message: "File size too large. Maximum size allowed is 5MB.",
      });
    }
    if (error.code === "LIMIT_FILE_COUNT") {
      return res.status(400).json({
        success: false,
        message: "Too many files. Only one file is allowed at a time.",
      });
    }
    if (error.code === "LIMIT_UNEXPECTED_FILE") {
      return res.status(400).json({
        success: false,
        message:
          "Unexpected field name. Please use 'csvfile' as the field name.",
      });
    }
  }

  if (error.code === "INVALID_FILE_TYPE") {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }

  next(error);
};

module.exports = { upload, handleUploadError };
