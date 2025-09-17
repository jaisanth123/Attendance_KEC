const fs = require("fs");
const csv = require("csv-parser");
const Student = require("../models/Student");

// Helper to trim ONLY trailing whitespace without touching inner or leading spaces
const trimEndOnly = (value) =>
  typeof value === "string" ? value.replace(/\s+$/u, "") : value;

// Safe uppercasing after trimming end spaces
const toUpperTrimEnd = (value) =>
  typeof value === "string" ? trimEndOnly(value).toUpperCase() : value;

// Validation function for student data
const validateStudentData = (data) => {
  const errors = [];

  const rollNo = trimEndOnly(data.rollNo);
  if (!rollNo || rollNo === "") {
    errors.push("Roll number is required");
  }

  const name = trimEndOnly(data.name);
  if (!name || name === "") {
    errors.push("Name is required");
  }

  const hostellerDayScholar = toUpperTrimEnd(data.hostellerDayScholar);
  if (
    !hostellerDayScholar ||
    !["HOSTELLER", "DAY SCHOLAR"].includes(hostellerDayScholar)
  ) {
    errors.push(
      'Hosteller/Day Scholar must be either "HOSTELLER" or "DAY SCHOLAR"'
    );
  }

  const gender = toUpperTrimEnd(data.gender);
  if (!gender || !["MALE", "FEMALE"].includes(gender)) {
    errors.push('Gender must be either "MALE" or "FEMALE"');
  }

  const yearOfStudy = toUpperTrimEnd(data.yearOfStudy);
  if (!yearOfStudy || !["I", "II", "III", "IV"].includes(yearOfStudy)) {
    errors.push("Year of study must be I, II, III, or IV");
  }

  const branch = trimEndOnly(data.branch);
  if (!branch || branch === "") {
    errors.push("Branch is required");
  }

  const section = trimEndOnly(data.section);
  if (!section || section === "") {
    errors.push("Section is required");
  }

  const parentMobileNo = trimEndOnly(data.parentMobileNo);
  if (!parentMobileNo || !/^\d{10}$/.test(parentMobileNo)) {
    errors.push("Parent mobile number must be 10 digits");
  }

  const studentMobileNo = trimEndOnly(data.studentMobileNo);
  if (!studentMobileNo || !/^\d{10}$/.test(studentMobileNo)) {
    errors.push("Student mobile number must be 10 digits");
  }

  const superPacc = toUpperTrimEnd(data.superPacc);
  if (!superPacc || !["YES", "NO"].includes(superPacc)) {
    errors.push('SuperPacc must be either "YES" or "NO"');
  }

  return errors;
};

exports.addStudent = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({
      success: false,
      message: "No file uploaded",
    });
  }

  const results = [];
  const errors = [];
  const filePath = req.file.path;
  let rowNumber = 0;

  let isFirstRow = true;
  fs.createReadStream(filePath)
    .pipe(
      csv([
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
      ])
    )
    .on("data", (data) => {
      // Skip the first row (header row)
      if (isFirstRow) {
        isFirstRow = false;
        return;
      }

      rowNumber++;

      // Normalize raw CSV values by trimming only trailing whitespace
      const preprocessed = Object.fromEntries(
        Object.entries(data).map(([key, value]) => [
          key,
          typeof value === "string" ? trimEndOnly(value) : value,
        ])
      );

      // Validate the data
      const validationErrors = validateStudentData(preprocessed);
      if (validationErrors.length > 0) {
        errors.push({
          row: rowNumber,
          rollNo: preprocessed.rollNo || "N/A",
          errors: validationErrors,
        });
        return;
      }

      // Normalize data
      const normalizedData = {
        rollNo: toUpperTrimEnd(preprocessed.rollNo),
        // Keep name's original casing and inner spaces; remove only trailing spaces
        name: trimEndOnly(preprocessed.name),
        hostellerDayScholar: toUpperTrimEnd(preprocessed.hostellerDayScholar),
        gender: toUpperTrimEnd(preprocessed.gender),
        yearOfStudy: toUpperTrimEnd(preprocessed.yearOfStudy),
        branch: toUpperTrimEnd(preprocessed.branch),
        section: toUpperTrimEnd(preprocessed.section),
        parentMobileNo: trimEndOnly(preprocessed.parentMobileNo),
        studentMobileNo: trimEndOnly(preprocessed.studentMobileNo),
        superPacc: toUpperTrimEnd(preprocessed.superPacc),
      };

      results.push(normalizedData);
    })
    .on("end", async () => {
      try {
        if (results.length === 0 && errors.length === 0) {
          return res.status(400).json({
            success: false,
            message: "CSV file is empty or invalid format",
          });
        }

        // De-duplicate within-batch by rollNo (keep first occurrence)
        const seen = new Set();
        const batchUnique = results.filter((r) => {
          if (seen.has(r.rollNo)) return false;
          seen.add(r.rollNo);
          return true;
        });

        // Upsert-only-on-miss to avoid duplicates even if indexes are missing
        let bulkResult = { upsertedCount: 0, matchedCount: 0 };
        if (batchUnique.length > 0) {
          const ops = batchUnique.map((doc) => ({
            updateOne: {
              filter: { rollNo: doc.rollNo },
              update: { $setOnInsert: doc },
              upsert: true,
            },
          }));

          bulkResult = await Student.bulkWrite(ops, { ordered: false });
        }

        const insertedCount = bulkResult.upsertedCount || 0;
        const duplicatesCount = batchUnique.length - insertedCount;

        // Prepare response with detailed stats
        const stats = {
          total: results.length + errors.length,
          inserted: insertedCount,
          duplicates: duplicatesCount,
          errors: errors.length,
          validRecords: results.length,
        };

        let message = "";
        if (insertedCount > 0) {
          message += `Successfully inserted ${insertedCount} new student(s). `;
        }
        if (duplicatesCount > 0) {
          message += `${duplicatesCount} duplicate(s) skipped. `;
        }
        if (errors.length > 0) {
          message += `${errors.length} record(s) had validation errors.`;
        }
        if (
          insertedCount === 0 &&
          duplicatesCount === 0 &&
          errors.length === 0
        ) {
          message = "No valid records found in the CSV file.";
        }

        res.json({
          success: true,
          message: message.trim(),
          stats: stats,
          validationErrors: errors.length > 0 ? errors : undefined,
        });
      } catch (err) {
        console.error("Upload error:", err);
        res.status(500).json({
          success: false,
          message: "Failed to upload to MongoDB. Please try again.",
          error:
            process.env.NODE_ENV === "development" ? err.message : undefined,
        });
      } finally {
        // Cleanup temp file
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      }
    })
    .on("error", (error) => {
      console.error("CSV parsing error:", error);
      res.status(400).json({
        success: false,
        message:
          "Error parsing CSV file. Please check the file format and try again.",
        error:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      });
    });
};
