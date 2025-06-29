const express = require('express');

// Import the controller functions
const {
  handleCustomAbsentMessage,
  generateAbsentStudentsMessage,
  handleDownloadAbsentReport,
  handleCustomDownloadAbsentReport
} = require('../controllers/reportController');

// Import authentication middleware
const { authenticateAdmin } = require('../middleware/auth');

const router = express.Router();

// Route to generate absent students' message (no authentication required)
router.get('/absentStudents', generateAbsentStudentsMessage);

// Apply authenticateAdmin to all subsequent routes
// router.use(authenticateAdmin);

// Route to generate custom absent students' message
router.get('/absentStudentsCustom', handleCustomAbsentMessage);

// Route to handle downloading the absent report for male students
router.get('/downloadreport/male', (req, res) => {
  handleDownloadAbsentReport('MALE', req, res);
});

// Route to handle downloading the absent report for female students
router.get('/downloadreport/female', (req, res) => {
  handleDownloadAbsentReport('FEMALE', req, res);
});

// Route to handle downloading a custom absent report (admin-only access)
router.get('/download-absent-report', handleCustomDownloadAbsentReport);

module.exports = router;

