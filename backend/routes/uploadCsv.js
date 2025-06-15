const express = require('express');
const multer = require('multer');
const csv = require('csv-parser');
const fs = require('fs');
const { MongoClient } = require('mongodb');

const router = express.Router();
const upload = multer({ dest: 'uploads/' });

const uri = "mongodb+srv://krrashmika2004:nhwUubZLhWrmu7Lr@cluster0.sfj4f.mongodb.net/AI_Attendence?retryWrites=true";

// POST /add-student
router.post('/add-student', upload.single('csvfile'), async (req, res) => {
  const results = [];
  const filePath = req.file.path;

  fs.createReadStream(filePath)
    .pipe(csv(['rollNo', 'name', 'hostellerDayScholar', 'gender', 'yearOfStudy', 'branch', 'section']))
    .on('data', (data) => results.push(data))
    .on('end', async () => {
      const client = new MongoClient(uri);
      try {
        await client.connect();
        const collection = client.db('AI_Attendence').collection('students');

        // Fetch existing roll numbers
        const rollNos = results.map(r => r.rollNo);
        const existing = await collection
          .find({ rollNo: { $in: rollNos } })
          .project({ rollNo: 1 })
          .toArray();

        const existingRollNos = new Set(existing.map(doc => doc.rollNo));

        // Filter out duplicates
        const newEntries = results.filter(r => !existingRollNos.has(r.rollNo));

        if (newEntries.length > 0) {
          await collection.insertMany(newEntries);
          res.send(`${newEntries.length} new student(s) inserted. Duplicates skipped.`);
        } else {
          res.send('No new students inserted. All roll numbers already exist.');
        }
      } catch (err) {
        console.error(err);
        res.status(500).send('Failed to upload to MongoDB.');
      } finally {
        await client.close();
        fs.unlinkSync(filePath); // cleanup
      }
    });
});

module.exports = router;
