const express = require('express');
const { MongoClient } = require('mongodb');

const router = express.Router();

const uri = "mongodb+srv://krrashmika2004:nhwUubZLhWrmu7Lr@cluster0.sfj4f.mongodb.net/AI_Attendence?retryWrites=true";

// 📌 Bulk delete: by yearOfStudy, branch, section
router.delete('/students', async (req, res) => {
  const { yearOfStudy, branch, section } = req.body;

  const filter = {};
  if (yearOfStudy) filter.yearOfStudy = yearOfStudy;
  if (branch) filter.branch = branch;
  if (section) filter.section = section;

  const client = new MongoClient(uri);
  try {
    await client.connect();
    const result = await client
      .db('AI_Attendence')
      .collection('students')
      .deleteMany(filter);

    res.send(`${result.deletedCount} student(s) deleted.`);
  } catch (err) {
    console.error(err);
    res.status(500).send('Error deleting students');
  } finally {
    await client.close();
  }
});

// 📌 Delete all entries by rollNo
router.delete('/student/:rollNo', async (req, res) => {
  const rollNo = req.params.rollNo;

  const client = new MongoClient(uri);
  try {
    await client.connect();
    const result = await client
      .db('AI_Attendence')
      .collection('students')
      .deleteMany({ rollNo }); // 🔁 Delete ALL matching rollNo

    if (result.deletedCount > 0) {
      res.send(`Deleted ${result.deletedCount} record(s) with rollNo ${rollNo}.`);
    } else {
      res.status(404).send(`No student found with rollNo ${rollNo}.`);
    }
  } catch (err) {
    console.error(err);
    res.status(500).send('Error deleting student(s)');
  } finally {
    await client.close();
  }
});


module.exports = router;
