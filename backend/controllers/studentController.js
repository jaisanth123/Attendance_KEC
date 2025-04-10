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
