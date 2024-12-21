const Student = require('../models/Student');
const Attendance = require('../models/Attendance');
const nodemailer = require("nodemailer");
const multer = require("multer");
const path = require("path");

// 1. Mark students as "On Duty"
exports.markOnDuty = async (req, res) => {
  const { rollNumbers, date, yearOfStudy, branch, section } = req.body;

  console.log(rollNumbers, date, yearOfStudy, branch, section);
  try {
    // Array to track roll numbers that are already marked
  
    // Create new On Duty records for the roll numbersd
    const result = await Attendance.updateMany(
      {
        rollNo: { $in: rollNumbers }, // Match roll numbers in the provided array
        date,                        // Match the specified date
        yearOfStudy,                 // Match the year of study
        branch,                      // Match the branch
        section,                     // Match the section
        status: 'Absent',            // Only update records marked as "Absent"
      },
      {
        $set: { status: 'On Duty' }, // Set the status to "On Duty"
      }
    );
    res.json({ message: 'Marked as On Duty successfully' });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error marking as On Duty' });
  }
};


// 2. Fetch Remaining Students (those not marked as "On Duty")


// Controller function to fetch students without attendance on a specified date
exports.getStudentsWithoutAttendance = async (req, res) => {
  const { yearOfStudy, branch, section, date } = req.query;

  // Ensure all required query parameters are provided
  if (!yearOfStudy || !branch || !section || !date) {
      return res.status(400).json({ message: "Please provide yearOfStudy, branch, section, and date" });
  }

  console.log("Query Parameters:", { yearOfStudy, branch, section, date });

  try {
      // Fetch all students in the specified year, branch, and section
      const allStudents = await Student.find({
          yearOfStudy,
          branch,
          section
      }).select('rollNo name -_id'); // Retrieve rollNo and name fields, excluding _id

      console.log("All Students Found:", allStudents);

      // Fetch students who have an attendance record for the specified date
      const attendanceRecords = await Attendance.find({
          date,
          yearOfStudy,
          branch,
          section
      }).select('rollNo'); // Retrieve only the roll numbers of students with attendance records

      console.log("Attendance Records Found:", attendanceRecords);

      // If attendance records and students are identical, send the message that attendance has already been marked
      const allRollNumbers = allStudents.map(student => student.rollNo);
      const attendedRollNumbers = attendanceRecords.map(record => record.rollNo);

      // Check if the attendance records cover all students and are the same
      if (allRollNumbers.length === attendedRollNumbers.length && 
          allRollNumbers.every(rollNo => attendedRollNumbers.includes(rollNo))) {
          return res.status(200).json({ message: "Attendance has already been marked for all students." });
      }

      // Filter students who do not have an attendance record for the specified date
      const studentsWithoutAttendance = allStudents.filter(student =>
          !attendedRollNumbers.includes(student.rollNo)
      );

      // Sort the resulting students by roll number (numeric part only)
      studentsWithoutAttendance.sort((a, b) => {
          const numA = parseInt(a.rollNo.replace(/[^0-9]/g, ''), 10);
          const numB = parseInt(b.rollNo.replace(/[^0-9]/g, ''), 10);
          return numA - numB;
      });

      // Send the filtered roll numbers and the total count of all students
      res.json({
          students: studentsWithoutAttendance.map(student => ({
              rollNo: student.rollNo,
              name: student.name
          })), // Send both rollNo and name
          totalStudents: allStudents.length // Send the total count of students found
      });
  } catch (error) {
      console.error("Error retrieving students without attendance:", error);
      res.status(500).json({ message: "Server error" });
  }
};

// 3. Mark students as "Absent"
exports.markAbsent = async (req, res) => {
  const { rollNumbers, date, yearOfStudy, branch, section } = req.body;

  console.log(rollNumbers, date, yearOfStudy, branch, section);
  try {
    // Iterate over each roll number

    // Create new absent records for the roll numbers
    const absentRecords = rollNumbers.map(rollNo => ({
      rollNo,
      date,
      status: 'Absent',
      yearOfStudy,
      branch,
      section,
      locked: false
    }));

    // Insert the new "Absent" records
    await Attendance.insertMany(absentRecords);
    res.json({ message: 'Marked as Absent successfully' });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error marking as Absent' });
  }
};


// 4. Mark remaining students as "Present"
exports.markRemainingPresent = async (req, res) => {
  const { yearOfStudy, branch, section, date } = req.body;

  try {
    // Fetch all students in the specified year, branch, and section
    const allStudents = await Student.find({ yearOfStudy, branch, section }).select('rollNo');

    // Fetch roll numbers from attendance records marked as "Absent", "On Duty", or "Present" already
    const markedAttendance = await Attendance.find({
      date,
      yearOfStudy,
      branch,
      section,
      status: { $in: ['Absent', 'On Duty', 'Present','SuperPacc'] }
    }).select('rollNo');

    // Extract roll numbers from marked attendance records
    const markedRollNumbers = markedAttendance.map(record => record.rollNo);

    // Filter students who are not in the marked roll numbers
    const remainingStudents = allStudents.filter(student => 
      !markedRollNumbers.includes(student.rollNo)
    );

    // Prepare attendance records to mark remaining students as "Present"
    const presentRecords = remainingStudents.map(student => ({
      rollNo: student.rollNo,
      date,
      status: 'Present',
      yearOfStudy,
      branch,
      section,
      locked:false
    }));

    // Array to track roll numbers with existing attendance


    // Insert the "Present" records for the remaining students
    await Attendance.insertMany(presentRecords);
    
    res.json({ message: 'Marked remaining students as Present', markedAsPresent: presentRecords.length });
  } catch (error) {
    console.error("Error marking remaining students as Present:", error);
    res.status(500).json({ message: 'Error marking remaining students as Present' });
  }
};



// Email sending function
const storage = multer.memoryStorage(); // Store files in memory, not on disk
const upload = multer({ storage: storage });

exports.sendEmail = async (req, res) => {
  const { subject, content, toEmails } = req.body;
  const file = req.file;

  if (!file) {
    return res.status(400).send({ message: "No file uploaded" });
  }

  if (!toEmails) {
    return res.status(400).send({ message: "No email addresses provided" });
  }

  const emailList = toEmails.split(",").map((email) => email.trim()); // Split and trim emails

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "vijayakanthm.23aim@kongu.edu", // Replace with your email
      pass: "ueqf sakc aeaw hchl", // Replace with your app-specific password
    },
  });

  const mailOptions = {
    from: "vijayakanthm.23aim@kongu.edu", // Replace with your email
    bcc: emailList, // Use BCC for all recipients
    subject: subject,
    text: content,
    attachments: [
      {
        filename: file.originalname, // Use original file name
        content: file.buffer, // Use the file stored in memory
      },
    ],
  };

  try {
    await transporter.sendMail(mailOptions);
    res.status(200).send({ message: "Email sent successfully" });
  } catch (error) {
    console.error("Error sending email:", error);
    res.status(500).send({ message: "Failed to send email" });
  }
};


exports.markSuperPaccAttendance = async (req, res) => {
  const { yearOfStudy, branch, section, date } = req.body;

  try {
    // Validate input
    if (!yearOfStudy || !branch || !section || !date) {
      return res.status(400).json({ message: 'All fields are required: yearOfStudy, branch, section, and date.' });
    }

    // Fetch students with superPacc set to 'YES' for the specified yearOfStudy, branch, and section
    const studentsWithSuperPacc = await Student.find({
      yearOfStudy,
      branch,
      section,
      superPacc: 'YES',
    }).select('rollNo');

    if (studentsWithSuperPacc.length === 0) {
      return res.status(404).json({ message: 'No students with SuperPacc found for the given criteria.' });
    }

    // Prepare attendance records
    const superPaccAttendanceRecords = studentsWithSuperPacc.map(student => ({
      rollNo: student.rollNo,
      date,
      status: 'SuperPacc',
      yearOfStudy,
      branch,
      section,
      locked: false,
    }));

    // Check if any attendance records already exist for the given date, yearOfStudy, branch, and section
    const existingRecords = await Attendance.find({
      yearOfStudy,
      branch,
      section,
      date,
    });

    // If existing records are found, update the status for absent students and insert for new students
    if (existingRecords.length > 0) {
      // Go through each existing record and update status to 'SuperPacc' for those marked absent
      const updatedRecords = [];
      for (let student of studentsWithSuperPacc) {
        const existingRecord = existingRecords.find(record => record.rollNo === student.rollNo);

        if (existingRecord) {
          // If the record exists but the status is not 'SuperPacc', update it
          if (existingRecord.status !== 'SuperPacc') {
            await Attendance.updateOne(
              { _id: existingRecord._id },
              { $set: { status: 'SuperPacc' } }
            );
            updatedRecords.push(existingRecord);
          }
        } else {
          // If no record exists, insert a new one
          await Attendance.create({
            rollNo: student.rollNo,
            date,
            status: 'SuperPacc',
            yearOfStudy,
            branch,
            section,
            locked: false,
          });
        }
      }

      res.status(200).json({
        message: 'Attendance updated successfully to SuperPacc.',
        recordsUpdated: updatedRecords.length,
        recordsAdded: superPaccAttendanceRecords.length - updatedRecords.length, // Records added
      });

    } else {
      // If no records exist, insert all the SuperPacc attendance records
      await Attendance.insertMany(superPaccAttendanceRecords);

      res.status(201).json({
        message: 'SuperPacc attendance marked successfully.',
        recordsAdded: superPaccAttendanceRecords.length,
      });
    }

  } catch (error) {
    console.error('Error marking SuperPacc attendance:', error);
    res.status(500).json({ message: 'Error marking SuperPacc attendance.' });
  }
};




exports.getAttendanceStates = async (req, res) => {
  const { yearOfStudy, branch, section, date } = req.query;

  // Ensure all required query parameters are provided
  if (!yearOfStudy || !branch || !section || !date) {
      return res.status(400).json({ message: "Please provide yearOfStudy, branch, section, and date" });
  }

  console.log("Query Parameters:", { yearOfStudy, branch, section, date });

  try {
      // Fetch all students in the specified year, branch, and section
      const allStudents = await Student.find({
          yearOfStudy,
          branch,
          section
      }).select('rollNo name -_id'); // Retrieve rollNo and name fields, excluding _id

      console.log("All Students Found:", allStudents);

      // Fetch attendance records for the specified date
      const attendanceRecords = await Attendance.find({
          date,
          yearOfStudy,
          branch,
          section
      }).select('rollNo status'); // Retrieve rollNo and attendance status fields

      console.log("Attendance Records Found:", attendanceRecords);

      // If no attendance records are found, return a message indicating attendance has not been marked
      if (attendanceRecords.length === 0) {
          return res.status(404).json({ message: "Attendance has not been marked for this class on this date." });
      }

      // Map the attendance states for each student
      const attendanceMap = attendanceRecords.reduce((acc, record) => {
          acc[record.rollNo] = record.status; // Map rollNo to its attendance status (e.g., "Present", "Absent", "On Duty")
          return acc;
      }, {});

      // For each student, get their attendance state from the attendance map, defaulting to "Absent" if no record exists
      const attendanceStates = allStudents.map(student => ({
          rollNo: student.rollNo,
          name: student.name,
          state: attendanceMap[student.rollNo] || 'Absent' // Default state is "Absent" if no record exists
      }));

      // Sort the attendance states by roll number (numeric part only)
      attendanceStates.sort((a, b) => {
          const numA = parseInt(a.rollNo.replace(/[^0-9]/g, ''), 10);
          const numB = parseInt(b.rollNo.replace(/[^0-9]/g, ''), 10);
          return numA - numB;
      });

      // Send the attendance states and the total count of all students
      res.json({
          attendanceStates, // Send the roll numbers with their mapped attendance states
          totalStudents: allStudents.length // Send the total count of students found
      });
  } catch (error) {
      console.error("Error retrieving attendance states:", error);
      res.status(500).json({ message: "Server error" });
  }
};





exports.getAttendanceStatusCount = async (req, res) => {
  const { yearOfStudy, branch, section, date } = req.query;

  // Ensure all required query parameters are provided
  if (!yearOfStudy || !branch || !section || !date) {
    return res.status(400).json({ message: "Please provide yearOfStudy, branch, section, and date" });
  }

  console.log("Query Parameters:", { yearOfStudy, branch, section, date });

  try {
    // Fetch all students in the specified year, branch, and section
    const allStudents = await Student.find({
      yearOfStudy,
      branch,
      section,
    }).select('rollNo name -_id'); // Retrieve rollNo and name fields, excluding _id

    console.log("All Students Found:", allStudents);

    // Fetch attendance records for the specified date
    const attendanceRecords = await Attendance.find({
      date,
      yearOfStudy,
      branch,
      section,
    }).select('rollNo status'); // Retrieve rollNo and attendance status fields

    console.log("Attendance Records Found:", attendanceRecords);

    // If no attendance records are found, return NaN for counts
    if (attendanceRecords.length === 0) {
      const classs = `${yearOfStudy}-${branch}-${section}`;
      return res.json({
        classs,
        absentCount: "N/A",
        otherStatusCount: "N/A",
      });
    }

    // Map the attendance states for each student
    const attendanceMap = attendanceRecords.reduce((acc, record) => {
      acc[record.rollNo] = record.status; // Map rollNo to its attendance status (e.g., "Present", "Absent", "On Duty")
      return acc;
    }, {});

    // For each student, get their attendance state from the attendance map, defaulting to "Absent" if no record exists
    const attendanceStates = allStudents.map(student => ({
      rollNo: student.rollNo,
      name: student.name,
      state: attendanceMap[student.rollNo] || 'Absent', // Default state is "Absent" if no record exists
    }));

    // Count students with "Absent" status and all other statuses
    let absentCount = 0;
    let otherStatusCount = 0;

    attendanceStates.forEach(student => {
      if (student.state === 'Absent') {
        absentCount++;
      } else {
        otherStatusCount++;
      }
    });

    const classs = `${yearOfStudy}-${branch}-${section}`;
    // Send the counts of "Absent" and "Other" statuses
    res.json({
      classs,
      absentCount,
      otherStatusCount,
    });
  } catch (error) {
    console.error("Error retrieving attendance status counts:", error);
    res.status(500).json({ message: "Server error" });
  }
};


exports.updateAttendanceStatus = async (req, res) => {
  const { yearOfStudy, branch, section, date, rollNumberStateMapping } = req.body;

  // Check for missing required fields
  if (!yearOfStudy || !branch || !section || !date || !rollNumberStateMapping) {
    return res.status(400).json({ message: "Missing required fields." });
  }

  try {
    // Fetch all students in the specified year, branch, and section
    const allStudents = await Student.find({ yearOfStudy, branch, section }).select('rollNo');

    // Iterate over the rollNumberStateMapping to update the state for each roll number
    for (const [rollNo, state] of Object.entries(rollNumberStateMapping)) {
      // Validate the provided state
      if (!['Present', 'Absent', 'On Duty', 'SuperPacc'].includes(state)) {
        return res.status(400).json({ message: `Invalid state for roll number ${rollNo}` });
      }

      // Check if the attendance record exists for the given rollNo and date
      const existingAttendance = await Attendance.findOne({
        rollNo, 
        yearOfStudy, 
        branch, 
        section, 
        date
      });

      if (existingAttendance) {
        // If the record exists, update the attendance status
        const updateResult = await Attendance.findOneAndUpdate(
          {
            rollNo,      // Match roll number
            yearOfStudy, // Match year of study
            branch,      // Match branch
            section,     // Match section
            date,        // Match date
          },
          {
            $set: { status: state }, // Update the state
          },
          { new: true, upsert: false } // Only update, don't create new records
        );

        console.log(`Attendance updated for roll number ${rollNo} to ${state}`);
      } else {
        // If the attendance record doesn't exist, create a new one with the given state
        const newAttendance = new Attendance({
          rollNo,
          date,
          status: state,
          yearOfStudy,
          branch,
          section,
          locked: false, // Assuming "locked" is required
        });

        await newAttendance.save();
        console.log(`New attendance created for roll number ${rollNo} with state ${state}`);
      }
    }

    // Return a success response after updating attendance
    res.status(200).json({ message: "Attendance updated successfully!" });
  } catch (error) {
    // Handle any errors that occur during the process
    console.error("Error updating attendance status:", error);
    res.status(500).json({ message: "Server error while updating attendance." });
  }
};