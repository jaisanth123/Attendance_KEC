const express = require("express");

const { authenticateUser, authenticateAdmin } = require("../middleware/auth");
const {
  loginUser,
  loginAdmin,
  changePassword,
} = require("../controllers/authController");

const router = express.Router();

router.post("/login/user", loginUser);
router.post("/login/admin", loginAdmin);
router.put("/admin/change-password", authenticateAdmin, changePassword);
router.put("/user/change-password", authenticateUser, changePassword);
module.exports = router;
