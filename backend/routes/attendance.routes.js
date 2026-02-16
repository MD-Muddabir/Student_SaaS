/**
 * Attendance Routes
 */

const express = require("express");
const router = express.Router();
const attendanceController = require("../controllers/attendance.controller");
const verifyToken = require("../middlewares/auth.middleware");
const allowRoles = require("../middlewares/role.middleware");

router.post("/", verifyToken, allowRoles("admin", "faculty"), attendanceController.markAttendance);
router.get("/", verifyToken, allowRoles("admin", "faculty"), attendanceController.getAttendance);
router.get("/percentage/:student_id", verifyToken, allowRoles("admin", "faculty", "student"), attendanceController.getAttendancePercentage);

module.exports = router;
