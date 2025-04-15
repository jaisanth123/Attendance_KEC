const jwt = require("jsonwebtoken");
const User = require("../models/userSchema");
const Admin = require("../models/adminSchema");

// Common function to check token and user role
const verifyTokenAndRole = async (authToken, roleType) => {
  try {
    // Decode the JWT token
    const decoded = jwt.verify(authToken, process.env.JWT_SECRET_KEY);
    let user;

    // Check for the user or admin based on the roleType
    if (roleType === "user") {
      user = await User.findById(decoded.id);
      if (!user) {
        throw new Error("User not found");
      }
    } else if (roleType === "admin") {
      user = await Admin.findById(decoded.id);
      if (!user) {
        throw new Error("Admin not found");
      }
    } else {
      throw new Error("Invalid role type specified");
    }

    return user;
  } catch (error) {
    // Handle token verification errors and user-related errors
    throw new Error(
      error.message || "Invalid token or user does not have the correct role"
    );
  }
};

// Extract token from headers
const getTokenFromHeaders = (req) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    return authHeader.split(" ")[1]; // Return the token part
  }
  return null;
};

// User authentication middleware
const authenticateUser = async (req, res, next) => {
  const authToken = getTokenFromHeaders(req);

  // Check if token is available
  if (!authToken) {
    return res.status(401).json({
      message: "No token found. You are not authorized to access this page.",
    });
  }

  try {
    const user = await verifyTokenAndRole(authToken, "user");
    req.user = user; // Attach user info to the request
    next();
  } catch (error) {
    return res
      .status(403)
      .json({ message: error.message || "Unauthorized access" });
  }
};

// Admin authentication middleware
const authenticateAdmin = async (req, res, next) => {
  const authToken = getTokenFromHeaders(req);
  //console.log(authToken);

  // Check if token is available
  if (!authToken) {
    return res.status(401).json({
      message: "No token found. You are not authorized to access this page.",
    });
  }

  try {
    const admin = await verifyTokenAndRole(authToken, "admin");
    req.admin = admin; // Attach admin info to the request
    next();
  } catch (error) {
    return res
      .status(403)
      .json({ message: "Access denied for non-admin users." });
  }
};
const authenticateStaff = async (req, res, next) => {
  const authToken = getTokenFromHeaders(req);
  //console.log(authToken);

  // Check if token is available
  if (!authToken) {
    return res.status(401).json({
      message: "No token found. You are not authorized to access this page.",
    });
  }

  try {
    const admin = await verifyTokenAndRole(authToken, "staff");
    req.admin = staff; // Attach admin info to the request
    next();
  } catch (error) {
    return res
      .status(403)
      .json({ message: "Access denied for non-staff users." });
  }
};

module.exports = { authenticateUser, authenticateAdmin, authenticateStaff };
