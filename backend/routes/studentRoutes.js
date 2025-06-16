const express = require("express");
const router = express.Router();
const studentController = require("../controllers/studentController");

// Test route
router.get("/test", (req, res) => {
  res.json({ message: "Student routes are working" });
});

// Define the route to get roll numbers by criteria
router.get("/remaining", studentController.fetchRemainingStudents);
//! update studnets data
router.get("/search/name", studentController.searchStudentsByName); // search by name
router.get("/search/rollno", studentController.searchStudentsByRollNo); // search by rollno for suggestions
router.get("/search/:rollNo", studentController.getStudentByRollNo); // fetch by rollno
router.put("/update-student-data/:rollNo", studentController.updateStudentData); // update by roll no
router.post("/create", studentController.createStudent);
router.delete("/delete/:rollNo", studentController.deleteStudentByRollNo);
router.get("/leaves", studentController.getStudentsWithLeaveCount);

// New routes for SuperPacc management
router.get("/superpacc/status", studentController.getStudentsBySuperPacc);
router.put(
  "/superpacc/update/:rollNo",
  studentController.updateSuperPaccStatus
);

// Add the batch update route
router.post("/superpacc/batch-update", studentController.batchUpdateSuperPacc);

// Add the year update route
router.put("/update-year", studentController.updateStudentYear);

module.exports = router;
