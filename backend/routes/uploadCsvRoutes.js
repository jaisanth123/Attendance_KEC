const express = require("express");
const router = express.Router();
const { upload, handleUploadError } = require("../middleware/upload"); // multer middleware
const studentController = require("../controllers/uploadCSVController");

router.post(
  "/add-student",
  upload.single("csvfile"),
  studentController.addStudent,
  handleUploadError
);

module.exports = router;
