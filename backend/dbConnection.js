// dbConnection.js
const mongoose = require("mongoose");

// MongoDB URI from MongoDB Atlas
const uri =
  "mongodb+srv://hodcse:Z3EZVI40t7lpr23S@cluster0.dm26ae7.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
// Connect to MongoDB

const connectDB = async () => {
  try {
    await mongoose.connect(uri, {
      //useNewUrlParser: true,
      //useUnifiedTopology: true,
    });
    console.log("Database connected successfully");
  } catch (error) {
    console.error("MongoDB connection error:", error);
    process.exit(1); // Exit process with failure
  }
};

module.exports = connectDB;
