const Student = require("../models/Student");
const Attendance = require("../models/Attendance");
const ExcelJS = require("exceljs");
// Helper function to convert Roman numerals to integers for sorting
const romanToInt = (roman) => {
  const romanNumerals = {
    I: 1,
    II: 2,
    III: 3,
    IV: 4,
  };
  return romanNumerals[roman] || 0; // Return 0 if invalid Roman numeral
};

const formatDate = (dateString) => {
  if (!dateString) return "";
  const [year, month, day] = dateString.split("-");
  return `${day}-${month}-${year}`;
};
// Controller to generate message of absent students
exports.generateAbsentStudentsMessage = async (req, res) => {
  const { yearOfStudy, branch, section, date } = req.query;

  console.log("generateAbsentStudentsMessage called with:", {
    yearOfStudy,
    branch,
    section,
    date,
  });

  try {
    // Validate required parameters
    if (!yearOfStudy || !branch || !section || !date) {
      console.log("Missing required parameters");
      return res.status(400).json({
        message:
          "Missing required parameters: yearOfStudy, branch, section, date",
      });
    }

    // Step 1: Fetch all students in the specified year, branch, and section
    const allStudents = await Student.find({
      yearOfStudy,
      branch,
      section,
    }).select("rollNo name hostellerDayScholar");
    console.log(
      `Found ${allStudents.length} students for ${yearOfStudy} ${branch} ${section}`
    );

    if (allStudents.length === 0) {
      console.log("No students found for the specified criteria");
      return res.status(404).json({
        message: `No students found for ${yearOfStudy} ${branch} ${section}`,
      });
    }

    // Step 2: Fetch attendance records for the specified date, year, branch, and section
    const attendanceRecords = await Attendance.find({
      date,
      yearOfStudy,
      branch,
      section,
    });
    console.log(
      `Found ${attendanceRecords.length} attendance records for ${date}`
    );

    // Step 3: Ensure each student has a record in the attendance collection
    const studentsWithAttendance = attendanceRecords.map(
      (record) => record.rollNo
    );
    const missingRecords = allStudents.filter(
      (student) => !studentsWithAttendance.includes(student.rollNo)
    );

    console.log(
      `Missing attendance records for ${missingRecords.length} students`
    );

    // If there are missing attendance records, return an error message
    if (missingRecords.length > 0) {
      // Sort the missing records by rollNo in ascending order
      missingRecords.sort((a, b) => {
        const numA = parseInt(a.rollNo.replace(/\D/g, "")); // Extract numeric part
        const numB = parseInt(b.rollNo.replace(/\D/g, ""));
        return numA - numB; // Compare numeric values
      });

      console.log("Returning missing records error");
      return res.status(400).json({
        message:
          "Not all students have attendance records for the specified day.",
        missingStudents: missingRecords.map((student) => ({
          rollNo: student.rollNo,
          name: student.name,
        })),
      });
    }

    // Step 4: Identify absent students
    const absentStudents = attendanceRecords
      .filter((record) => record.status === "Absent")
      .map((record) => {
        const student = allStudents.find(
          (student) => student.rollNo === record.rollNo
        );
        const hostellerOrDayScholar =
          student.hostellerDayScholar === "HOSTELLER"
            ? "(Hostel)"
            : "(Day Scholar)";
        return ` ${record.rollNo}-${student.name} ${hostellerOrDayScholar}`;
      });

    console.log(`Found ${absentStudents.length} absent students`);

    // Step 5: Format the date before using it in the message
    const formattedDate = formatDate(date);
    let mHeader = `${yearOfStudy} year ${branch}-${section}\nDate : ${formattedDate}\n`;

    if (absentStudents.length === 0) {
      console.log("No absent students found, returning NIL message");
      return res.json({
        message: mHeader,
        details: "NIL ABSENTEES",
      });
    }

    // Step 6: Generate and send the message
    let messageHeader = ` ${yearOfStudy} year ${branch}-${section}\nDate : ${formattedDate}\nTHE FOLLOWING STUDENTS ARE ABSENT`;

    let absentDetails = absentStudents.join("\n");

    console.log("Sending response with absent students");
    // Send the response with the formatted message and details
    res.json({
      message: messageHeader,
      details: absentDetails,
    });

    // Step 7: Lock the attendance for this date, year, branch, and section
    console.log(
      `Attendance locked for ${yearOfStudy} ${branch} ${section} on ${formattedDate}`
    );
  } catch (error) {
    console.error("Error generating absent students message:", error);
    res
      .status(500)
      .json({ message: "Error generating absent students message" });
  }
};

//Generate content for Hostel Gmail Report
// Convert Roman numeral to integer

exports.handleCustomAbsentMessage = async (req, res) => {
    const { gender, dateMode, date, startDate, endDate, month, hostellerDayScholar, yearOfStudy, section, branch } =
      req.query; // Added branch filter from query params
    console.log(
      "Request received to generate report for gender:",
      gender,
      "dateMode:",
      dateMode,
      "date:",
      date,
      "hostellerDayScholar:",
      hostellerDayScholar,
      "yearOfStudy:",
      yearOfStudy,
      "section:",
      section,
      "branch:",
      branch
    );
  
    try {
      let allStudents;
  
      // Fetch students based on gender selection
      if (gender === "ALL") {
        allStudents = await Student.find().select(
          "rollNo name gender yearOfStudy branch section hostellerDayScholar"
        );
      } else {
        allStudents = await Student.find({ gender }).select(
          "rollNo name gender yearOfStudy branch section hostellerDayScholar"
        );
      }
      console.log("Total students fetched:", allStudents.length);
  
      // Apply branch filter if provided
      if (branch && branch !== "ALL") {
        allStudents = allStudents.filter((student) => student.branch === branch);
      }
  
      // Apply hostellerDayScholar filter if provided
      if (hostellerDayScholar && hostellerDayScholar !== "ALL") {
        allStudents = allStudents.filter(
          (student) => student.hostellerDayScholar === hostellerDayScholar
        );
      }
  
      // Apply yearOfStudy filter if provided
      if (yearOfStudy && yearOfStudy !== "ALL") {
        const yearsArray = yearOfStudy.split(",");
        allStudents = allStudents.filter((student) =>
          yearsArray.includes(student.yearOfStudy)
        );
      }
  
      // Apply section filter if provided
      if (section && section !== "ALL") {
        const sectionsArray = section.split(",");
        allStudents = allStudents.filter((student) =>
          sectionsArray.includes(student.section)
        );
      }
  
      // Determine date query based on dateMode
      let dateQuery = {};
      if (dateMode === 'range') {
        dateQuery = { $gte: startDate, $lte: endDate };
      } else if (dateMode === 'month') {
        dateQuery = { $regex: `^${month}` }; // Matches YYYY-MM
      } else {
        dateQuery = date;
      }
  
      // Fetch attendance records for the specified date (only absent students)
      const attendanceRecords = await Attendance.find({
        date: dateQuery,
        status: "Absent",
      }).select("rollNo date");
    console.log(
      "Total attendance records fetched for absent students:",
      attendanceRecords.length
    );

    // Filter students who were absent on the given date(s)
    const absences = [];
    attendanceRecords.forEach((record) => {
      const student = allStudents.find((s) => s.rollNo === record.rollNo);
      if (student) {
        absences.push({
          ...student.toObject(),
          date: record.date,
        });
      }
    });

    console.log("Total absences found:", absences.length);

    if (absences.length === 0) {
      console.log(
        `No absent students found for specified criteria.`
      );
      return res.status(404).json({
        message: `No absent students found for specified criteria.`,
      });
    }

    // Sort absences first by date, then by yearOfStudy, then by branch, then by rollNo
    absences.sort((a, b) => {
      if (a.date !== b.date) {
        return new Date(a.date) - new Date(b.date);
      }
      const yearA = romanToInt(a.yearOfStudy);
      const yearB = romanToInt(b.yearOfStudy);

      if (yearA === yearB) {
        const branchOrder = ["AIDS", "AIML"]; // Custom order for branches
        const branchAIndex = branchOrder.indexOf(a.branch);
        const branchBIndex = branchOrder.indexOf(b.branch);

        if (branchAIndex === branchBIndex) {
          const rollNoA = parseInt(a.rollNo.replace(/\D/g, "")); 
          const rollNoB = parseInt(b.rollNo.replace(/\D/g, ""));
          return rollNoA - rollNoB; 
        }
        return branchAIndex - branchBIndex;
      }
      return yearA - yearB;
    });

    // Prepare the message header
    let dateStrForHeader = dateMode === 'range' ? `${formatDate(startDate)} to ${formatDate(endDate)}` : dateMode === 'month' ? month : formatDate(date);
    let messageHeader = `Kongu Engineering College\nDepartment of Artificial Intelligence\nStudents Absentees List - ${dateStrForHeader}\n\n`;

    // Group absences by date, then by year and branch
    let groupedByDate = {};

    absences.forEach((absence) => {
      if (!groupedByDate[absence.date]) {
        groupedByDate[absence.date] = {};
      }
      
      const groupKey = `${absence.yearOfStudy} ${absence.branch}-${absence.section}`; 

      if (!groupedByDate[absence.date][groupKey]) {
        groupedByDate[absence.date][groupKey] = [];
      }

      const hostellerOrDayScholar =
        absence.hostellerDayScholar === "HOSTELLER" ? "Hostel" : "Day Scholar";
      groupedByDate[absence.date][groupKey].push(
        `${absence.rollNo} ${absence.name} (${hostellerOrDayScholar})`
      );
    });

    // Format the grouped absences
    let absentDetails = "";
    for (let dateKey in groupedByDate) {
      absentDetails += `\n--- Date: ${formatDate(dateKey)} ---\n`;
      const groupedDetails = groupedByDate[dateKey];
      for (let groupKey in groupedDetails) {
        absentDetails += `\n${groupKey}\n`;
        absentDetails += groupedDetails[groupKey].join("\n") + "\n";
      }
    }

    // Send the response with the formatted message and details
    res.json({
      message: messageHeader,
      details: absentDetails.trim(),
    });
  } catch (error) {
    console.error("Error generating report:", error);
    res.status(500).send("Error generating absent students report");
  }
};

exports.handleDownloadAbsentReport = async (gender, req, res) => {
  const { date } = req.query;
  console.log(
    "Request received to generate report for gender:",
    gender,
    "and date:",
    date
  );

  try {
    // Fetch all students of the specified gender
    const allStudents = await Student.find({ gender }).select(
      "rollNo name yearOfStudy branch section hostellerDayScholar"
    );
    console.log("Total students fetched:", allStudents.length);

    // Fetch attendance records for the specified date (only absent students)
    const attendanceRecords = await Attendance.find({
      date,
      status: "Absent",
    }).select("rollNo");
    console.log(
      "Total attendance records fetched for absent students:",
      attendanceRecords.length
    );

    // Filter students who were absent on the given date
    const absentStudents = allStudents.filter((student) =>
      attendanceRecords.some((record) => record.rollNo === student.rollNo)
    );
    console.log("Absent Students before hostel filter:", absentStudents);

    // Filter absent students to include only HOSTELLER or HOSTELER
    const filteredAbsentStudents = absentStudents.filter(
      (student) =>
        student.hostellerDayScholar &&
        (student.hostellerDayScholar.toUpperCase() === "HOSTELLER" ||
          student.hostellerDayScholar.toUpperCase() === "HOSTELER")
    );
    console.log("Filtered Absent Students:", filteredAbsentStudents);

    if (filteredAbsentStudents.length === 0) {
      console.log(
        `No absent ${gender.toLowerCase()} students found for ${date}.`
      );
      return res.status(404).json({
        message: `No absent ${gender.toLowerCase()} students found for ${date}.`,
      });
    }

    // Sort absent students by yearOfStudy (Roman numeral order) and then by rollNo
    filteredAbsentStudents.sort((a, b) => {
      const yearA = romanToInt(a.yearOfStudy);
      const yearB = romanToInt(b.yearOfStudy);
      if (yearA === yearB) {
        const rollNoA = parseInt(a.rollNo.replace(/\D/g, "")); // Extract numeric part of rollNo
        const rollNoB = parseInt(b.rollNo.replace(/\D/g, ""));
        return rollNoA - rollNoB;
      }
      return yearA - yearB;
    });

    console.log("Absent students sorted successfully");
    const formattedDate = formatDate(date);

    // Determine Hostel type based on gender (Boys or Girls)
    const hostelType = gender === "MALE" ? "Boys" : "Girls";

    // Prepare the report data with merged header rows
    const reportData = [
      ["Kongu Engineering College"],
      ["Department of Artificial Intelligence"],
      [`${hostelType} Hostel Students Absentees List - ${formattedDate}`],
      ["S.No", "Roll No", "Student Name", "Year", "Branch"],
    ];

    // Add the absent students' data
    filteredAbsentStudents.forEach((student, index) => {
      reportData.push([
        index + 1,
        student.rollNo,
        student.name,
        student.yearOfStudy,
        `${student.branch}-${student.section}`,
      ]);
    });

    // Create a new workbook and worksheet
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Absent Students");

    // Add the report data to the worksheet
    worksheet.addRows(reportData);

    // Apply row height adjustments
    worksheet.getRow(1).height = 25; // First header row
    worksheet.getRow(2).height = 25; // Second header row
    worksheet.getRow(3).height = 25; // Third header row
    worksheet.getRow(4).height = 25; // Column headers row
    for (let row = 5; row <= reportData.length; row++) {
      worksheet.getRow(row).height = 25; // Data rows
    }

    // Apply thicker borders around the header and filled cells (data rows)
    const borderStyle = {
      top: { style: "medium" },
      left: { style: "medium" },
      bottom: { style: "medium" },
      right: { style: "medium" },
    };

    // Apply borders for header row (row 4)
    for (let col = 1; col <= 5; col++) {
      worksheet.getCell(4, col).border = borderStyle;
      worksheet.getCell(4, col).alignment = {
        horizontal: "center",
        vertical: "middle",
      }; // Center-align
      worksheet.getCell(4, col).font = {
        bold: true,
        name: "Times New Roman",
        size: 12,
      };
    }

    // Apply borders for each row with student data (starting from row 5)
    for (let row = 5; row <= reportData.length; row++) {
      for (let col = 1; col <= 5; col++) {
        worksheet.getCell(row, col).border = borderStyle;
        worksheet.getCell(row, col).alignment = {
          horizontal: "center",
          vertical: "middle",
        }; // Center-align
        worksheet.getCell(row, col).font = {
          name: "Times New Roman",
          size: 12,
        };
      }
    }

    console.log("Borders and alignment applied successfully.");

    // Merge and center the header cells
    worksheet.mergeCells("A1:E1"); // Merging the first header row
    worksheet.mergeCells("A2:E2"); // Merging the second header row
    worksheet.mergeCells("A3:E3"); // Merging the third header row

    // Set header cell alignment to center
    worksheet.getCell("A1").alignment = {
      horizontal: "center",
      vertical: "middle",
    };
    worksheet.getCell("A1").font = {
      name: "Times New Roman",
      size: 12,
      bold: true,
    };
    worksheet.getCell("A2").alignment = {
      horizontal: "center",
      vertical: "middle",
    };
    worksheet.getCell("A2").font = {
      name: "Times New Roman",
      size: 12,
      bold: true,
    };
    worksheet.getCell("A3").alignment = {
      horizontal: "center",
      vertical: "middle",
    };
    worksheet.getCell("A3").font = {
      name: "Times New Roman",
      size: 12,
      bold: true,
    };

    console.log("Header merged and centered successfully.");

    // Set the file as an attachment for download
    res.attachment(`${hostelType}_Absent_Students_${formattedDate}.xlsx`);

    // Write the workbook to the response as a stream
    await workbook.xlsx.write(res);
    res.end(); // End the response stream to indicate completion
    console.log("Excel file sent to the client successfully.");
  } catch (error) {
    console.error("Error generating report:", error);
    res
      .status(500)
      .json({ message: "Error generating absent students report" });
  }
};

exports.handleCustomDownloadAbsentReport = async (req, res) => {
  const { gender, dateMode, date, startDate, endDate, month, hostellerDayScholar, yearOfStudy, section, branch } =
    req.query;
  console.log(
    "Request received to generate report for gender:",
    gender,
    "dateMode:",
    dateMode,
    "date:",
    date,
    "hostellerDayScholar:",
    hostellerDayScholar,
    "yearOfStudy:",
    yearOfStudy,
    "section:",
    section,
    "branch:",
    branch
  );

  try {
    let allStudents;

    // Fetch students based on gender selection
    if (gender === "ALL") {
      allStudents = await Student.find().select(
        "rollNo name gender yearOfStudy branch section hostellerDayScholar"
      );
    } else {
      allStudents = await Student.find({ gender }).select(
        "rollNo name gender yearOfStudy branch section hostellerDayScholar"
      );
    }
    console.log("Total students fetched:", allStudents.length);

    // Apply branch filter if provided
    if (branch && branch !== "ALL") {
      allStudents = allStudents.filter((student) => student.branch === branch);
    }

    // Apply hostellerDayScholar filter if provided
    if (hostellerDayScholar && hostellerDayScholar !== "ALL") {
      allStudents = allStudents.filter(
        (student) => student.hostellerDayScholar === hostellerDayScholar
      );
    }

    // Apply yearOfStudy filter if provided
    if (yearOfStudy && yearOfStudy !== "ALL") {
      const yearsArray = yearOfStudy.split(",");
      allStudents = allStudents.filter((student) =>
        yearsArray.includes(student.yearOfStudy)
      );
    }

    // Apply section filter if provided
    if (section && section !== "ALL") {
      const sectionsArray = section.split(",");
      allStudents = allStudents.filter((student) =>
        sectionsArray.includes(student.section)
      );
    }

    // Determine date query based on dateMode
    let dateQuery = {};
    if (dateMode === 'range') {
      dateQuery = { $gte: startDate, $lte: endDate };
    } else if (dateMode === 'month') {
      dateQuery = { $regex: `^${month}` }; // Matches YYYY-MM
    } else {
      dateQuery = date;
    }

    // Fetch attendance records for the specified date (only absent students)
    const attendanceRecords = await Attendance.find({
      date: dateQuery,
      status: "Absent",
    }).select("rollNo date");
    console.log(
      "Total attendance records fetched for absent students:",
      attendanceRecords.length
    );

    // Filter students who were absent on the given date
    const absences = [];
    attendanceRecords.forEach((record) => {
      const student = allStudents.find((s) => s.rollNo === record.rollNo);
      if (student) {
        absences.push({
          ...student.toObject(),
          date: record.date,
        });
      }
    });

    console.log("Total absences found:", absences.length);

    if (absences.length === 0) {
      console.log(
        `No absent students found for specified criteria.`
      );
      return res.status(404).json({
        message: `No absent students found for specified criteria.`,
      });
    }

    // Sort absences first by date, then by yearOfStudy, then by branch, then by rollNo
    absences.sort((a, b) => {
      if (a.date !== b.date) {
        return new Date(a.date) - new Date(b.date);
      }
      const yearA = romanToInt(a.yearOfStudy);
      const yearB = romanToInt(b.yearOfStudy);

      if (yearA === yearB) {
        const branchOrder = ["AIDS", "AIML"];
        const branchAIndex = branchOrder.indexOf(a.branch);
        const branchBIndex = branchOrder.indexOf(b.branch);

        if (branchAIndex === branchBIndex) {
          if (a.section !== b.section) {
            return a.section.localeCompare(b.section);
          }
          const rollNoA = parseInt(a.rollNo.replace(/\D/g, ""));
          const rollNoB = parseInt(b.rollNo.replace(/\D/g, ""));
          return rollNoA - rollNoB;
        }
        return branchAIndex - branchBIndex;
      }
      return yearA - yearB;
    });

    console.log("Absent students sorted successfully");
    let dateStrForHeader = dateMode === 'range' ? `${formatDate(startDate)} to ${formatDate(endDate)}` : dateMode === 'month' ? month : formatDate(date);

    // Dynamic title based on filters
    const titleParts = [
      "Students Absentees List",
      `Date: ${dateStrForHeader}`,
      gender !== "ALL" ? `Gender: ${gender}` : null,
      branch !== "ALL" ? `Branch: ${branch}` : null,
      yearOfStudy !== "ALL" ? `Year: ${yearOfStudy}` : null,
      section !== "ALL" ? `Section: ${section}` : null,
      hostellerDayScholar !== "ALL"
        ? `Resident Type: ${hostellerDayScholar}`
        : null,
    ]
      .filter(Boolean)
      .join(", ");

    const headers =
      hostellerDayScholar === "ALL"
        ? ["S.No", "Roll No", "Student Name", "Section", "ResidentType", "Year"]
        : ["S.No", "Roll No", "Student Name", "Section", "Year"];

    const reportData = [
      ["Kongu Engineering College"],
      ["Department of Artificial Intelligence"],
      [titleParts],
      headers,
    ];

    // Add the absent students' data grouped by date
    let currentDate = null;
    let sNo = 1;
    let dateRowIndices = []; // To keep track of rows that just have the Date so we can merge them
    
    absences.forEach((absence) => {
      const formattedAbsenceDate = formatDate(absence.date);

      if (currentDate !== formattedAbsenceDate) {
        if (currentDate !== null) {
          reportData.push([]); // Leave an empty line before next date
        }
        currentDate = formattedAbsenceDate;
        sNo = 1; // Reset S.No for each date group

        // Push the date header row
        reportData.push([`Date: ${formattedAbsenceDate}`]);
        dateRowIndices.push(reportData.length); // record the 1-based row index for merging later
      }

      const row = [
        sNo++,
        absence.rollNo,
        absence.name,
        absence.section,
      ];

      if (hostellerDayScholar === "ALL") {
        row.push(absence.hostellerDayScholar);
      }

      row.push(absence.yearOfStudy); // Year is always the last column

      reportData.push(row);
    });

    // Create a new workbook and worksheet
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Absent Students");

    // Set column widths for better readability
    const columns = [
      { width: 8 },  // S.No
      { width: 15 }, // Roll No
      { width: 35 }, // Student Name
      { width: 10 }, // Section
    ];
    if (hostellerDayScholar === "ALL") {
      columns.push({ width: 15 }); // ResidentType
    }
    columns.push({ width: 10 }); // Year (last column)
    worksheet.columns = columns;

    // Add the report data to the worksheet
    worksheet.addRows(reportData);

    // Apply row height adjustments
    for (let row = 1; row <= reportData.length; row++) {
      worksheet.getRow(row).height = 25;
    }

    // Apply thinner borders and alignment
    const borderStyle = {
      top: { style: "thin" },
      left: { style: "thin" },
      bottom: { style: "thin" },
      right: { style: "thin" },
    };

    const columnCount = headers.length;

    for (let col = 1; col <= columnCount; col++) {
      worksheet.getCell(4, col).border = borderStyle;
      worksheet.getCell(4, col).alignment = {
        horizontal: "center",
        vertical: "middle",
      };
      worksheet.getCell(4, col).font = {
        bold: true,
        size: 12,
      };
    }

    for (let row = 5; row <= reportData.length; row++) {
      // Don't apply borders to empty rows
      if (!worksheet.getCell(row, 1).value) continue;
      
      const isDateRow = dateRowIndices.includes(row);

      for (let col = 1; col <= columnCount; col++) {
        // Only apply border to the first column if it's a date row and we plan to merge it,
        // or apply to all if it's a normal data row. Actually, applying to all cells in a merged row is standard.
        worksheet.getCell(row, col).border = borderStyle;
        worksheet.getCell(row, col).alignment = {
          horizontal: isDateRow ? "left" : "center",
          vertical: "middle",
        };
        worksheet.getCell(row, col).font = {
          size: 12,
          bold: isDateRow, // Make date row bold
        };
      }

      if (isDateRow) {
        worksheet.mergeCells(`A${row}:${String.fromCharCode(64 + columnCount)}${row}`);
      }
    }

    // Merge section cells (column D/4) and Year cells (last column) vertically for students in the same class/year
    let startMergeRowSec = -1;
    let currentSection = null;
    let currentSectionYear = null; // To track if Year changes while Section is same
    
    let startMergeRowYear = -1;
    let currentYear = null;

    const mergeColumn = (colLetter, startRow, endRow) => {
      if (startRow !== -1 && endRow > startRow) {
        const cellRef = `${colLetter}${startRow}:${colLetter}${endRow}`;
        worksheet.mergeCells(cellRef);
        worksheet.getCell(`${colLetter}${startRow}`).alignment = {
          vertical: "middle",
          horizontal: "center",
        };
      }
    };

    const colLetterYear = String.fromCharCode(64 + columnCount);

    for (let row = 5; row <= reportData.length; row++) {
      const isDataRow = !!worksheet.getCell(row, 1).value && !dateRowIndices.includes(row);
      
      if (isDataRow) {
        const sec = worksheet.getCell(row, 4).value; // Section is 4th column
        const yr = worksheet.getCell(row, columnCount).value; // Year is last column

        // Check if Year breaks
        if (yr !== currentYear) {
          mergeColumn(colLetterYear, startMergeRowYear, row - 1);
          currentYear = yr;
          startMergeRowYear = row;
        }

        // Check if Section breaks (either different section, or same section but different year)
        if (sec !== currentSection || yr !== currentSectionYear) {
          mergeColumn("D", startMergeRowSec, row - 1);
          currentSection = sec;
          currentSectionYear = yr;
          startMergeRowSec = row;
        }
      } else {
        // Not a data row, break the block
        mergeColumn("D", startMergeRowSec, row - 1);
        mergeColumn(colLetterYear, startMergeRowYear, row - 1);
        
        currentSection = null;
        currentSectionYear = null;
        startMergeRowSec = -1;
        currentYear = null;
        startMergeRowYear = -1;
      }
    }
    // Handle any trailing blocks at the end of the sheet
    mergeColumn("D", startMergeRowSec, reportData.length);
    mergeColumn(colLetterYear, startMergeRowYear, reportData.length);

    console.log("Borders and alignment applied successfully.");

    // Merge and center the header cells
    worksheet.mergeCells(`A1:${String.fromCharCode(64 + columnCount)}1`);
    worksheet.mergeCells(`A2:${String.fromCharCode(64 + columnCount)}2`);
    worksheet.mergeCells(`A3:${String.fromCharCode(64 + columnCount)}3`);

    worksheet.getCell("A1").alignment = {
      horizontal: "center",
      vertical: "middle",
    };
    worksheet.getCell("A1").font = {
      size: 12,
      bold: true,
    };
    worksheet.getCell("A2").alignment = {
      horizontal: "center",
      vertical: "middle",
    };
    worksheet.getCell("A2").font = {
      size: 12,
      bold: true,
    };
    worksheet.getCell("A3").alignment = {
      horizontal: "center",
      vertical: "middle",
    };
    worksheet.getCell("A3").font = {
      size: 12,
      bold: true,
    };

    console.log("Header merged and centered successfully.");

    // Set the file as an attachment for download
    const safeFilenameDate = dateStrForHeader.replace(/ /g, "_");
    res.attachment(`Absent_Students_${safeFilenameDate}.xlsx`);

    // Write the workbook to the response as a stream
    await workbook.xlsx.write(res);
    res.end();
    console.log("Excel file sent to the client successfully.");
  } catch (error) {
    console.error("Error generating report:", error);
    res
      .status(500)
      .json({ message: "Error generating absent students report", error: error.message, stack: error.stack });
  }
};
