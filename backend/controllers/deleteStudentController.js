// const express = require('express');
// const router = express.Router();

// // 📌 Bulk delete
// router.delete('/students', async (req, res) => {
//   const { yearOfStudy, branch, section } = req.body;
//   const filter = {};

//   if (yearOfStudy) filter.yearOfStudy = yearOfStudy;
//   if (branch) filter.branch = branch;
//   if (section) filter.section = section;

//   const db = req.app.locals.db;
//   try {
//     const result = await db.collection('students').deleteMany(filter);
//     res.send(`${result.deletedCount} student(s) deleted.`);
//   } catch (err) {
//     console.error(err);
//     res.status(500).send('Error deleting students');
//   }
// });

// // 📌 Delete by rollNo
// router.delete('/student/:rollNo', async (req, res) => {
//   const rollNo = req.params.rollNo;
//   const db = req.app.locals.db;

//   try {
//     const result = await db.collection('students').deleteMany({ rollNo });
//     if (result.deletedCount > 0) {
//       res.send(`Deleted ${result.deletedCount} record(s) with rollNo ${rollNo}.`);
//     } else {
//       res.status(404).send(`No student found with rollNo ${rollNo}.`);
//     }
//   } catch (err) {
//     console.error(err);
//     res.status(500).send('Error deleting student(s)');
//   }
// });

// module.exports = router;


const express = require('express');
const Student = require('../models/Student');


// 📌 Bulk delete
exports.bulkDelete =async (req, res) => {
  const { yearOfStudy, branch, section } = req.body;
  const filter = {};

  if (yearOfStudy) filter.yearOfStudy = yearOfStudy;
  if (branch) filter.branch = branch;
  if (section) filter.section = section;

  try {
    const result = await Student.deleteMany(filter);
    res.send(`${result.deletedCount} student(s) deleted.`);
  } catch (err) {
    console.error(err);
    res.status(500).send('Error deleting students');
  }
};

// 📌 Delete by rollNo
exports.deleteByRollNo =async (req, res) => {
  const { rollNo } = req.params;

  try {
    const result = await Student.deleteMany({ rollNo });

    if (result.deletedCount > 0) {
      res.send(`Deleted ${result.deletedCount} record(s) with rollNo ${rollNo}.`);
    } else {
      res.status(404).send(`No student found with rollNo ${rollNo}.`);
    }
  } catch (err) {
    console.error(err);
    res.status(500).send('Error deleting student(s)');
  }
};

