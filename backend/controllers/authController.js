const User = require("../models/userSchema");
const Staff = require("../models/staffSchema");
const Admin = require("../models/adminSchema");
const { sendToken } = require("../utils/jwtToken");

const loginUser = async (req, res) => {
  const { username, password } = req.body;

  const user = await User.findOne({ username });

  if (!user) {
    return res.status(400).json({ message: "Invalid credentials" });
  }

  const isPasswordMatch = await user.comparePassword(password);

  if (!isPasswordMatch) {
    return res.status(400).json({ message: "Invalid credentials" });
  }

  sendToken(user, 200, res, "User logged in successfully");
};

const loginStaff = async (req, res) => {
  const { username, password } = req.body;

  const staff = await Staff.findOne({ username });

  if (!staff) {
    return res.status(400).json({ message: "Invalid credentials" });
  }

  const isPasswordMatch = await staff.comparePassword(password);

  if (!isPasswordMatch) {
    return res.status(400).json({ message: "Invalid credentials" });
  }

  sendToken(staff, 200, res, "Admin logged in successfully");
};
const loginAdmin = async (req, res) => {
  const { username, password } = req.body;

  const admin = await Admin.findOne({ username });

  if (!admin) {
    return res.status(400).json({ message: "Invalid credentials" });
  }

  const isPasswordMatch = await admin.comparePassword(password);

  if (!isPasswordMatch) {
    return res.status(400).json({ message: "Invalid credentials" });
  }

  sendToken(admin, 200, res, "Admin logged in successfully");
};

//! this is the controller for change password
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    // Validate request body
    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Both current password and new password are required",
      });
    }

    // Validate new password length
    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: "New password must be at least 6 characters long",
      });
    }

    // Determine if the request is from a user or admin
    let user = req.user || req.admin;

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Check if current password is correct
    const isPasswordMatch = await user.comparePassword(currentPassword);
    if (!isPasswordMatch) {
      return res.status(401).json({
        success: false,
        message: "Current password is incorrect",
      });
    }

    // Update password
    user.password = newPassword;
    await user.save();

    res.status(200).json({
      success: true,
      message: "Password updated successfully",
    });
  } catch (error) {
    console.error("Change password error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while changing password",
      error: error.message,
    });
  }
};
module.exports = { loginUser, loginAdmin, loginStaff, changePassword };
