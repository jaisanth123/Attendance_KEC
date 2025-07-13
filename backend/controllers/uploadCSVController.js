const fs = require("fs");
const csv = require("csv-parser");
const Student = require("../models/Student");

exports.addStudent = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({
      success: false,
      message: "No file uploaded",
    });
  }

  const results = [];
  const filePath = req.file.path;
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
      ])
    )
    .on("data", (data) => {
      // Skip the first row (header row)
      if (isFirstRow) {
        isFirstRow = false;
        return;
      }
      results.push(data);
    })
    .on("end", async () => {
      try {
        if (results.length === 0) {
          return res.status(400).json({
            success: false,
            message: "CSV file is empty or invalid format",
          });
        }

        const rollNos = results.map((r) => r.rollNo);
        const existing = await Student.find({
          rollNo: { $in: rollNos },
        }).select("rollNo");
        const existingRollNos = new Set(existing.map((doc) => doc.rollNo));
        const newEntries = results.filter(
          (r) => !existingRollNos.has(r.rollNo)
        );

        if (newEntries.length > 0) {
          await Student.insertMany(newEntries);
          res.json({
            success: true,
            message: `${newEntries.length} new student(s) inserted. Duplicates skipped.`,
          });
        } else {
          res.json({
            success: true,
            message:
              "No new students inserted. All roll numbers already exist.",
          });
        }
      } catch (err) {
        console.error("Upload error:", err);
        res.status(500).json({
          success: false,
          message: "Failed to upload to MongoDB.",
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
        message: "Error parsing CSV file. Please check the file format.",
      });
    });
};
  