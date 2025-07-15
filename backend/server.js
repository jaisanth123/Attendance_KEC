// app.js
const express = require("express");
const connectDB = require("./dbConnection"); // Import the database connection function
const cors = require("cors"); // Import the CORS middleware
const bodyParser = require("body-parser");
const app = express();
const cookieParser = require("cookie-parser");

// Connect to the database
connectDB();
require("dotenv").config(); // Load environment variables from .env file
// Middleware
// CORS configuration
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);

    const allowedOrigins = [
      "https://attendance-kec-mfv7.onrender.com",
      "https://attendance-kec.onrender.com",
      "http://localhost:5173",
      "http://localhost:3000",
    ];

    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"], // Allowed methods
  credentials: true, // Allow cookies and credentials
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"], // Allowed headers
  optionsSuccessStatus: 200, // Some legacy browsers (IE11, various SmartTVs) choke on 204
};

// Apply CORS middleware globally
app.use(cors(corsOptions));

// Handle preflight requests
app.options("*", cors(corsOptions));

// Additional CORS headers for better compatibility
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );
  res.header("Access-Control-Allow-Credentials", "true");

  if (req.method === "OPTIONS") {
    res.sendStatus(200);
  } else {
    next();
  }
});

// Enable CORS for all routes
app.use(cookieParser());
app.use(express.json());
app.use(bodyParser.json());
// Routes
const studentRoutes = require("./routes/studentRoutes");
const attendanceRoutes = require("./routes/attendanceRoutes");
const reportRoutes = require("./routes/reportRoutes");
const authRoutes = require("./routes/authRoutes");
const uploadRoutes = require("./routes/uploadCsvRoutes");
//const excelReportRoutes = require('./routes/excelReportRoutes');

app.use("/api/students", studentRoutes);
app.use("/api/attendance", attendanceRoutes);
app.use("/api/report", reportRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/upload", uploadRoutes);
//app.use('/api/excel', excelReportRoutes);

// Health check endpoint
app.get("/", (req, res) => {
  res.json({ message: "Server is running!" });
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
