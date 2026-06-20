const mongoose = require("mongoose");
const Attendance = require("./backend/models/Attendance");

mongoose.connect("mongodb://localhost:27017/attendance", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(async () => {
  const records = await Attendance.find({ status: "Absent" });
  console.log("Total Absent Records:", records.length);
  if (records.length > 0) {
    console.log("Sample:", records[0]);
  }
  mongoose.disconnect();
}).catch(console.error);
