const express = require('express');
const router = express.Router();
const attendanceController = require('../controllers/attendanceController');
const { authenticateAdmin } = require('../middleware/auth');

const multer = require("multer");
//console.log('attendanceRoutes.js loaded');  // Log to confirm if file is being loaded

// Route to mark students as "On Duty"
router.post('/onDuty', attendanceController.markOnDuty);

// Route to fetch students not marked as "On Duty"
router.get('/rollnumbers', attendanceController.getStudentsWithoutAttendance);

// Route to mark students as "Absent"
router.post('/absent', attendanceController.markAbsent);

// Route to mark remaining students as "Present"
router.post('/mark-remaining-present', attendanceController.markRemainingPresent);
router.post('/mark-SuperPacc', attendanceController.markSuperPaccAttendance);
router.post('/mark-updatestatus', authenticateAdmin,attendanceController.updateAttendanceStatus);
router.get('/get-attendancestatus',authenticateAdmin, attendanceController.getAttendanceStates);
router.get('/getAttendanceStatusCount',attendanceController.getAttendanceStatusCount);

const storage = multer.memoryStorage(); // Store files in memory, not on disk
const upload = multer({ storage: storage });

router.post("/send-email",upload.single("file"), attendanceController.sendEmail);
router.post("/hostelreport",upload.single("file"), attendanceController.sendEmail);
module.exports = router;

