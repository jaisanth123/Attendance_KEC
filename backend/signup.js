const mongoose = require("mongoose");
const User = require("./models/userSchema.js");
const Admin = require("./models/adminSchema.js");
const Staff = require("./models/staffSchema.js");

// Connect to your MongoDB database
mongoose
  .connect(
    "mongodb+srv://krrashmika2004:nhwUubZLhWrmu7Lr@cluster0.sfj4f.mongodb.net/AI_Attendence?retryWrites=true&w=majority",
    {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    }
  )
  .then(() => console.log("Database connected"))
  .catch((err) => console.log("Database connection error:", err));

// Create a User
const createUser = async () => {
  try {
    const user = new User({
      name: "User Name",
      username: "user123", // Make sure 'username' is unique in your DB
      password: "userpassword123",
    });

    await user.save();
    console.log("User created:", user);
  } catch (error) {
    console.log("Error creating user:", error);
  }
};

// Create an Admin
const createAdmin = async () => {
  try {
    const admin = new Admin({
      name: "Admin Name",
      username: "admin123", // Make sure 'username' is unique in your DB
      password: "adminpassword123",
    });
    //
    await admin.save();
    console.log("Admin created:", admin);
  } catch (error) {
    console.log("Error creating admin:", error);
  }
};

const createStaff = async () => {
  try {
    const admin = new Staff({
      name: "Staff Name ",
      username: "staff123", // Make sure 'username' is unique in your DB
      password: "staff123",
    });
    //
    await admin.save();
    console.log("Staff created:", Staff);
  } catch (error) {
    console.log("Error creating admin:", error);
  }
};

// Call the functions to create the user and admin
// createUser();
// createAdmin();
createStaff();
