const mongoose = require("mongoose");

// Define the Student Schema
const studentSchema = new mongoose.Schema(
  {
    rollNo: {
      type: String,
      required: [true, "Roll number is required"],
      unique: true,
      uppercase: true,
      trim: true,
      index: true,
    },
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      maxlength: [100, "Name cannot exceed 100 characters"],
    },
    hostellerDayScholar: {
      type: String,
      required: [true, "Hosteller/Day Scholar status is required"],
      enum: {
        values: ["HOSTELLER", "DAY SCHOLAR"],
        message:
          "Hosteller/Day Scholar must be either HOSTELLER or DAY SCHOLAR",
      },
      uppercase: true,
    },
    gender: {
      type: String,
      required: [true, "Gender is required"],
      enum: {
        values: ["MALE", "FEMALE"],
        message: "Gender must be either MALE or FEMALE",
      },
      uppercase: true,
    },
    yearOfStudy: {
      type: String,
      required: [true, "Year of study is required"],
      enum: {
        values: ["I", "II", "III", "IV"],
        message: "Year of study must be I, II, III, or IV",
      },
      uppercase: true,
    },
    branch: {
      type: String,
      required: [true, "Branch is required"],
      uppercase: true,
      trim: true,
      maxlength: [50, "Branch cannot exceed 50 characters"],
    },
    section: {
      type: String,
      required: [true, "Section is required"],
      uppercase: true,
      trim: true,
      maxlength: [10, "Section cannot exceed 10 characters"],
    },
    parentMobileNo: {
      type: String,
      required: [true, "Parent mobile number is required"],
      validate: {
        validator: function (v) {
          return /^\d{10}$/.test(v);
        },
        message: "Parent mobile number must be exactly 10 digits",
      },
      trim: true,
    },
    studentMobileNo: {
      type: String,
      required: [true, "Student mobile number is required"],
      validate: {
        validator: function (v) {
          return /^\d{10}$/.test(v);
        },
        message: "Student mobile number must be exactly 10 digits",
      },
      trim: true,
    },
    superPacc: {
      type: String,
      required: [true, "SuperPacc status is required"],
      enum: {
        values: ["YES", "NO"],
        message: "SuperPacc must be either YES or NO",
      },
      uppercase: true,
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt fields
  }
);

// Create compound indexes for better query performance
studentSchema.index({ branch: 1, yearOfStudy: 1, section: 1 });
studentSchema.index({ hostellerDayScholar: 1 });
studentSchema.index({ superPacc: 1 });

// Create and export the Student model
const Student = mongoose.model("Student", studentSchema);
module.exports = Student;
