const express = require('express');
const multer = require('multer');
const csv = require('csv-parser');
const fs = require('fs');
const { MongoClient } = require('mongodb');

const router = express.Router();
const upload = multer({ dest: 'uploads/' });

const uri = "mongodb+srv://krrashmika2004:nhwUubZLhWrmu7Lr@cluster0.sfj4f.mongodb.net/AI_Attendence?retryWrites=true";

// Endpoint: POST /add-student
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
        await collection.insertMany(results);
        res.send('CSV uploaded and inserted into MongoDB.');
      } catch (err) {
        console.error(err);
        res.status(500).send('Failed to upload to MongoDB.');
      } finally {
        await client.close();
        fs.unlinkSync(filePath); // clean up
      }
    });
});

module.exports = router;
