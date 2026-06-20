const { handleCustomDownloadAbsentReport } = require("./controllers/reportController");
const mongoose = require("mongoose");
const Student = require("./models/Student");
const Attendance = require("./models/Attendance");
const dotenv = require("dotenv");
dotenv.config();

mongoose.connect(process.env.MONGODB_URI || "mongodb://localhost:27017/attendance", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(async () => {
  const req = {
    query: {
      gender: 'ALL',
      dateMode: 'single',
      date: '2026-06-19',
      startDate: '2026-06-20',
      endDate: '2026-06-20',
      month: '2026-06',
      hostellerDayScholar: 'HOSTELLER',
      yearOfStudy: 'ALL',
      section: 'ALL',
      branch: 'CSE'
    }
  };

  const res = {
    status: (code) => ({
      json: (data) => console.log("Status:", code, "JSON:", data)
    }),
    attachment: (filename) => console.log("Attachment:", filename),
    end: () => console.log("End called")
  };
  
  // mock res for stream
  res.on = () => {};
  res.once = () => {};
  res.emit = () => {};
  res.write = () => {};
  
  // Actually workbook.xlsx.write(res) requires a proper stream.
  // We can mock it better by passing a dummy stream.
  const { PassThrough } = require('stream');
  const stream = new PassThrough();
  stream.attachment = res.attachment;
  stream.status = res.status;
  stream.end = () => console.log("Stream end");

  try {
    await handleCustomDownloadAbsentReport(req, stream);
    console.log("Success");
  } catch (err) {
    console.error("Caught error:", err);
  }

  mongoose.disconnect();
}).catch(console.error);
