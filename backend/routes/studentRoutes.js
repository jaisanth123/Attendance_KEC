const express = require("express");
const router = express.Router();
const studentController = require("../controllers/studentController");

// Define the route to get roll numbers by criteria
router.get("/remaining", studentController.fetchRemainingStudents);
//! update studnets data
router.get("/search", studentController.searchStudentsByName); // search by name
// router.get("/:rollNo", studentController.getStudentByRollNo); // setch by rollno
router.put("/update-student-data/:rollNo", studentController.updateStudentData); // update by roll no
router.post("/create", studentController.createStudent);
router.delete("/delete/:rollNo", studentController.deleteStudentByRollNo);
router.get("/leaves", studentController.getStudentsWithLeaveCount);

module.exports = router;
