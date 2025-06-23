const express = require('express');

// Import the controller functions
const {
  deleteStudentByRollNo,
  bulkDelete
} = require('../controllers/deleteStudentController');

const { authenticateAdmin } = require('../middleware/auth');

const router = express.Router();

router.delete('/students', bulkDelete);
router.delete('/student/:rollNo', deleteStudentByRollNo);