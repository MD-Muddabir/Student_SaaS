/**
 * Attendance Controller
 * Handles attendance marking and tracking
 */

const { Attendance, Student, Class, User } = require("../models");
const { Op } = require("sequelize");

/**
 * Mark attendance
 * @route POST /api/attendance
 * @access Admin, Faculty
 */
exports.markAttendance = async (req, res) => {
    try {
        const { student_id, class_id, date, status } = req.body;
        const institute_id = req.user.institute_id;

        // Check if attendance already marked
        const existing = await Attendance.findOne({
            where: { student_id, class_id, date, institute_id },
        });

        if (existing) {
            await existing.update({ status });
            return res.status(200).json({
                success: true,
                message: "Attendance updated successfully",
                data: existing,
            });
        }

        const attendance = await Attendance.create({
            institute_id,
            student_id,
            class_id,
            date,
            status,
        });

        res.status(201).json({
            success: true,
            message: "Attendance marked successfully",
            data: attendance,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

/**
 * Get attendance records
 * @route GET /api/attendance
 * @access Admin, Faculty
 */
exports.getAttendance = async (req, res) => {
    try {
        const { student_id, class_id, start_date, end_date, page = 1, limit = 50 } = req.query;
        const institute_id = req.user.institute_id;

        const offset = (page - 1) * limit;
        const whereClause = { institute_id };

        if (student_id) whereClause.student_id = student_id;
        if (class_id) whereClause.class_id = class_id;
        if (start_date && end_date) {
            whereClause.date = {
                [Op.between]: [start_date, end_date],
            };
        }

        const { count, rows } = await Attendance.findAndCountAll({
            where: whereClause,
            limit: parseInt(limit),
            offset: parseInt(offset),
            order: [["date", "DESC"]],
            include: [
                {
                    model: Student,
                    attributes: ["id", "roll_number"],
                    include: [
                        {
                            model: User,
                            attributes: ["name"],
                        },
                    ],
                },
                {
                    model: Class,
                    attributes: ["id", "name"],
                },
            ],
        });

        res.status(200).json({
            success: true,
            message: "Attendance retrieved successfully",
            data: {
                attendance: rows,
                pagination: {
                    total: count,
                    page: parseInt(page),
                    limit: parseInt(limit),
                    totalPages: Math.ceil(count / limit),
                },
            },
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

/**
 * Get attendance percentage
 * @route GET /api/attendance/percentage/:student_id
 * @access Admin, Faculty, Student (own record)
 */
exports.getAttendancePercentage = async (req, res) => {
    try {
        const { student_id } = req.params;
        const { start_date, end_date } = req.query;
        const institute_id = req.user.institute_id;

        const whereClause = { institute_id, student_id };

        if (start_date && end_date) {
            whereClause.date = {
                [Op.between]: [start_date, end_date],
            };
        }

        const totalDays = await Attendance.count({
            where: whereClause,
        });

        const presentDays = await Attendance.count({
            where: { ...whereClause, status: "present" },
        });

        const percentage = totalDays > 0 ? ((presentDays / totalDays) * 100).toFixed(2) : 0;

        res.status(200).json({
            success: true,
            message: "Attendance percentage calculated successfully",
            data: {
                total_days: totalDays,
                present_days: presentDays,
                absent_days: totalDays - presentDays,
                percentage: parseFloat(percentage),
            },
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

module.exports = exports;
