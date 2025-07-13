 const express = require("express");
const router = express.Router();
const upload = require("../middleware/upload"); // multer middleware
const studentController = require("../controllers/uploadCSVController");

router.post(
  "/add-student",
  upload.single("csvfile"),
  studentController.addStudent
);

module.exports = router;
