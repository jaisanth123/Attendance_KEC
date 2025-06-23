// const express = require('express');
// const multer = require('multer');
// const csv = require('csv-parser');
// const fs = require('fs');

// const router = express.Router();
// const upload = multer({ dest: 'uploads/' });

// // POST /add-student
// router.post('/add-student', upload.single('csvfile'), async (req, res) => {
//   const results = [];
//   const filePath = req.file.path;

//   fs.createReadStream(filePath)
//     .pipe(csv(['rollNo', 'name', 'hostellerDayScholar', 'gender', 'yearOfStudy', 'branch', 'section']))
//     .on('data', (data) => results.push(data))
//     .on('end', async () => {
//       const db = req.app.locals.db;
//       try {
//         const collection = db.collection('students');

//         const rollNos = results.map(r => r.rollNo);
//         const existing = await collection
//           .find({ rollNo: { $in: rollNos } })
//           .project({ rollNo: 1 })
//           .toArray();

//         const existingRollNos = new Set(existing.map(doc => doc.rollNo));
//         const newEntries = results.filter(r => !existingRollNos.has(r.rollNo));

//         if (newEntries.length > 0) {
//           await collection.insertMany(newEntries);
//           res.send(`${newEntries.length} new student(s) inserted. Duplicates skipped.`);
//         } else {
//           res.send('No new students inserted. All roll numbers already exist.');
//         }
//       } catch (err) {
//         console.error(err);
//         res.status(500).send('Failed to upload to MongoDB.');
//       } finally {
//         fs.unlinkSync(filePath); // cleanup temp file
//       }
//     });
// });

// module.exports = router;

const fs = require('fs');
const csv = require('csv-parser'); // make sure it's installed
const Student = require('../models/Student'); // adjust the path if needed

exports.addStudent = async (req, res) => {
  const results = [];
  const filePath = req.file.path;

  fs.createReadStream(filePath)
    .pipe(csv(['rollNo', 'name', 'hostellerDayScholar', 'gender', 'yearOfStudy', 'branch', 'section']))
    .on('data', (data) => results.push(data))
    .on('end', async () => {
      try {
        const rollNos = results.map(r => r.rollNo);
        const existing = await Student.find({ rollNo: { $in: rollNos } }).select('rollNo');
        const existingRollNos = new Set(existing.map(doc => doc.rollNo));
        const newEntries = results.filter(r => !existingRollNos.has(r.rollNo));

        if (newEntries.length > 0) {
          await Student.insertMany(newEntries);
          res.send(`${newEntries.length} new student(s) inserted. Duplicates skipped.`);
        } else {
          res.send('No new students inserted. All roll numbers already exist.');
        }
      } catch (err) {
        console.error(err);
        res.status(500).send('Failed to upload to MongoDB.');
      } finally {
        fs.unlinkSync(filePath); // cleanup temp file
      }
    });
};
