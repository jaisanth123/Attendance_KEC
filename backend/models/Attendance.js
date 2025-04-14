const mongoose = require("mongoose");

const attendanceSchema = new mongoose.Schema({
  rollNo: { type: String, required: true },
  date: { type: String, required: true },
  status: {
    type: String,
    enum: ["Present", "Absent", "On Duty", "SuperPacc"],
    required: true,
  },
  yearOfStudy: { type: String, required: true },
  branch: { type: String, required: true },
  section: { type: String, required: true },
  locked: { type: Boolean, default: false }, // New field to lock attendance for a year/branch/section
  leaveCount: { type: Number, default: 0 },
  infoStatus: {
    type: String,
    enum: ["NA", "Informed", "NotInformed"],
    required: true,
    default: "NotInformed",
  },
});

module.exports = mongoose.model("Attendance", attendanceSchema);
