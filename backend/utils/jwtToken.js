const jwt = require("jsonwebtoken");
const User = require("../models/userSchema");
const Admin = require("../models/adminSchema");
const Staff = require("../models/staffSchema");

const sendToken = (user, statusCode, res, message) => {
  let token;

  if (user instanceof Admin || user instanceof User || user instanceof Staff) {
    token = user.getJWTToken();
  } else {
    throw new Error("Unsupported user type");
  }

  const options = {
    expires: new Date(
      Date.now() + process.env.COOKIE_EXPIRE * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
  };

  res.status(statusCode).json({
    success: true,
    user,
    message,
    token,
  });
};

module.exports = { sendToken };
