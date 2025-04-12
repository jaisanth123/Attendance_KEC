const Student = require("../models/Student");
const Attendance = require("../models/Attendance");

// Controller function to fetch students without attendance on a specified date
//! <===== fetch reamining students ======>
exports.fetchRemainingStudents = async (req, res) => {
  const { yearOfStudy, branch, section, date } = req.query;

  try {
    // Fetch roll numbers of students marked as "Absent" on the specified date
    const absentStudents = await Attendance.find({
      date,
      status: "Absent", // Fetch students marked as "Absent"
      yearOfStudy,
      branch,
      section,
    }).select("rollNo -_id");

    // Extract roll numbers from the absent students
    const rollNumbers = absentStudents.map((student) => student.rollNo);

    // Fetch the names of the students corresponding to these roll numbers
    const studentsWithNames = await Student.find({
      rollNo: { $in: rollNumbers }, // Match roll numbers from Attendance
    }).select("rollNo name -_id");

    // Sort the students by roll number (numeric part only)
    studentsWithNames.sort((a, b) => {
      const numA = parseInt(a.rollNo.replace(/[^0-9]/g, ""), 10);
      const numB = parseInt(b.rollNo.replace(/[^0-9]/g, ""), 10);
      return numA - numB;
    });

    // Respond with the sorted students including both rollNo and name
    res.json({
      students: studentsWithNames,
    });
  } catch (error) {
    console.error("Error fetching remaining students:", error);
    res.status(500).json({ message: "Error fetching remaining students" });
  }
};

//! <=== Search by students name ===>
exports.searchStudentsByName = async (req, res) => {
  const { name } = req.query;

  try {
    // Validate search term
    if (!name || name.trim() === "") {
      return res.status(400).json({
        success: false,
        message: "Name search term is required",
      });
    }

    // Create a case-insensitive regex pattern for partial name matching
    const nameRegex = new RegExp(name, "i");

    // Find students whose names match the search pattern
    const students = await Student.find({ name: nameRegex })
      .select(
        "rollNo name hostellerDayScholar gender yearOfStudy branch section parentMobileNo studentMobileNo superPacc"
      )
      .sort("rollNo");

    // Check if any students were found
    if (students.length === 0) {
      return res.status(200).json({
        success: true,
        message: "No students found matching the search term",
        data: [],
      });
    }

    // Return the matching students
    res.status(200).json({
      success: true,
      count: students.length,
      data: students,
    });
  } catch (error) {
    console.error("Error searching students by name:", error);
    res.status(500).json({
      success: false,
      message: "Error searching for students",
      error: error.message,
    });
  }
};

//!  <======= search students by roll no =======>
exports.getStudentByRollNo = async (req, res) => {
  const { rollNo } = req.params;

  try {
    // Validate roll number
    if (!rollNo) {
      return res.status(400).json({
        success: false,
        message: "Roll number is required",
      });
    }

    // Find the student by roll number
    const student = await Student.findOne({ rollNo });

    // Check if student exists
    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found with the provided roll number",
      });
    }

    // Return the student information
    res.status(200).json({
      success: true,
      data: student,
    });
  } catch (error) {
    console.error("Error fetching student data:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching student data",
    });
  }
};

//! delete Controller function
exports.deleteStudentByRollNo = async (req, res) => {
  const { rollNo } = req.params;

  try {
    // Validate roll number
    if (!rollNo) {
      return res.status(400).json({
        success: false,
        message: "Roll number is required",
      });
    }

    // Find and delete the student
    const deletedStudent = await Student.findOneAndDelete({ rollNo });

    // Check if student existed
    if (!deletedStudent) {
      return res.status(404).json({
        success: false,
        message: "Student not found with the provided roll number",
      });
    }

    // Return success response
    res.status(200).json({
      success: true,
      message: "Student deleted successfully",
      data: deletedStudent,
    });
  } catch (error) {
    console.error("Error deleting student:", error);
    res.status(500).json({
      success: false,
      message: "Error deleting student",
      error: error.message,
    });
  }
};

//! create student
exports.createStudent = async (req, res) => {
  const studentData = req.body;
  try {
    // Check if student data is provided
    if (!studentData || Object.keys(studentData).length === 0) {
      return res.status(400).json({
        success: false,
        message: "No student data provided",
      });
    }

    // Validate required fields
    const requiredFields = ["rollNo", "name", "branch"];
    for (const field of requiredFields) {
      if (!studentData[field]) {
        return res.status(400).json({
          success: false,
          message: `${field} is required`,
        });
      }
    }

    // Check if student with this roll number already exists
    const existingStudent = await Student.findOne({
      rollNo: studentData.rollNo,
    });
    if (existingStudent) {
      return res.status(409).json({
        success: false,
        message: "Student with this roll number already exists",
      });
    }

    // Filter to only include allowed fields (same as in update controller)
    const allowedFields = [
      "rollNo",
      "name",
      "hostellerDayScholar",
      "gender",
      "yearOfStudy",
      "branch",
      "section",
      "parentMobileNo",
      "studentMobileNo",
      "superPacc",
    ];

    // Filter out any fields that aren't in our schema
    const validStudentData = Object.keys(studentData)
      .filter((key) => allowedFields.includes(key))
      .reduce((obj, key) => {
        obj[key] = studentData[key];
        return obj;
      }, {});

    // Create new student document
    const newStudent = new Student(validStudentData);
    await newStudent.save();

    // Respond with success and the new student data
    res.status(201).json({
      success: true,
      message: "Student created successfully",
      data: newStudent,
    });
  } catch (error) {
    console.error("Error creating student:", error);
    res.status(500).json({
      success: false,
      message: "Error creating student",
      error: error.message,
    });
  }
};
//! <======= get all students name and class info for suggestion =======>
exports.getAllStudentsBasicInfo = async (req, res) => {
  try {
    // Find all students but only select the needed fields
    const students = await Student.find()
      .select("rollNo name yearOfStudy branch section")
      .sort("rollNo");

    // Check if any students exist
    if (students.length === 0) {
      return res.status(200).json({
        success: true,
        message: "No students found in the database",
        data: [],
      });
    }

    // Return the students data
    res.status(200).json({
      success: true,
      count: students.length,
      data: students,
    });
  } catch (error) {
    console.error("Error fetching students basic info:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching students information",
      error: error.message,
    });
  }
};

//! <======= Update student data ============>
exports.updateStudentData = async (req, res) => {
  const { rollNo } = req.params;
  const updateData = req.body;

  try {
    // Validate roll number
    if (!rollNo) {
      return res.status(400).json({
        success: false,
        message: "Roll number is required",
      });
    }

    // Check if update data is provided
    if (!updateData || Object.keys(updateData).length === 0) {
      return res.status(400).json({
        success: false,
        message: "No update data provided",
      });
    }

    // Validate update fields match the schema
    const allowedFields = [
      "name",
      "hostellerDayScholar",
      "gender",
      "yearOfStudy",
      "branch",
      "section",
      "parentMobileNo",
      "studentMobileNo",
      "superPacc",
    ];

    // Filter out any fields that aren't in our schema
    const validUpdateData = Object.keys(updateData)
      .filter((key) => allowedFields.includes(key))
      .reduce((obj, key) => {
        obj[key] = updateData[key];
        return obj;
      }, {});

    // Check if there are any valid fields to update
    if (Object.keys(validUpdateData).length === 0) {
      return res.status(400).json({
        success: false,
        message: "No valid update fields provided",
      });
    }

    // Find the student by roll number and update their data
    const updatedStudent = await Student.findOneAndUpdate(
      { rollNo },
      { $set: validUpdateData },
      { new: true } // Return the updated document
    );

    // Check if student exists
    if (!updatedStudent) {
      return res.status(404).json({
        success: false,
        message: "Student not found with the provided roll number",
      });
    }

    // Respond with success and the updated student data
    res.status(200).json({
      success: true,
      message: "Student data updated successfully",
      data: updatedStudent,
    });
  } catch (error) {
    console.error("Error updating student data:", error);
    res.status(500).json({
      success: false,
      message: "Error updating student data",
      error: error.message,
    });
  }
};

exports.getStudentsWithLeaveCount = async (req, res) => {
  try {
    const { date, yearOfStudy, branch, section } = req.query;

    // Validate required parameters
    if (!date || !yearOfStudy || !branch || !section) {
      return res.status(400).json({
        success: false,
        message:
          "Missing required parameters: date, yearOfStudy, branch, section",
      });
    }

    // Use aggregation pipeline to find students with leaveCount > 0
    const studentsWithLeaveCount = await Attendance.aggregate([
      {
        $match: {
          date: date,
          yearOfStudy: yearOfStudy,
          branch: branch,
          section: section,
          status: "Absent",
          leaveCount: { $gt: 0 },
        },
      },
      {
        $project: {
          _id: 0,
          rollNo: 1,
          leaveCount: 1,
        },
      },
      {
        $sort: { leaveCount: -1 },
      },
    ]);

    // Extract roll numbers for the next query
    const rollNumbers = studentsWithLeaveCount.map((student) => student.rollNo);

    // Fetch student names based on roll numbers
    const studentsDetails = await Student.find({
      rollNo: { $in: rollNumbers },
    }).select("rollNo name -_id");

    // Combine leave count with student names
    const result = studentsWithLeaveCount.map((student) => {
      const studentDetail = studentsDetails.find(
        (detail) => detail.rollNo === student.rollNo
      );
      return {
        rollNo: student.rollNo,
        leaveCount: student.leaveCount,
        name: studentDetail ? studentDetail.name : null, // Include name if found
      };
    });

    res.status(200).json({
      success: true,
      date: date,
      yearOfStudy: yearOfStudy,
      branch: branch,
      section: section,
      count: result.length,
      data: result,
    });
  } catch (error) {
    console.error("Error fetching students with leave count:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch students with leave count",
      error: error.message,
    });
  }
};
