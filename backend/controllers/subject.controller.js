/**
 * Subject Controller
 * Handles CRUD operations for subjects
 */

const { Subject, Faculty, Class } = require("../models");
const { Op } = require("sequelize");

exports.createSubject = async (req, res) => {
    try {
        const { name, code, class_id, faculty_id, description } = req.body;
        const institute_id = req.user.institute_id;

        const subject = await Subject.create({
            institute_id,
            name,
            code,
            class_id,
            faculty_id,
            description,
        });

        res.status(201).json({
            success: true,
            message: "Subject created successfully",
            data: subject,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

exports.getAllSubjects = async (req, res) => {
    try {
        const { page = 1, limit = 10, class_id } = req.query;
        const institute_id = req.user.institute_id;

        const offset = (page - 1) * limit;
        const whereClause = { institute_id };

        if (class_id) {
            whereClause.class_id = class_id;
        }

        const { count, rows } = await Subject.findAndCountAll({
            where: whereClause,
            limit: parseInt(limit),
            offset: parseInt(offset),
            order: [["name", "ASC"]],
            include: [
                {
                    model: Faculty,
                    attributes: ["id", "specialization"],
                },
                {
                    model: Class,
                    attributes: ["id", "name"],
                },
            ],
        });

        res.status(200).json({
            success: true,
            message: "Subjects retrieved successfully",
            data: {
                subjects: rows,
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

exports.getSubjectById = async (req, res) => {
    try {
        const { id } = req.params;
        const institute_id = req.user.institute_id;

        const subject = await Subject.findOne({
            where: { id, institute_id },
            include: [
                {
                    model: Faculty,
                    attributes: ["id", "specialization"],
                },
                {
                    model: Class,
                    attributes: ["id", "name"],
                },
            ],
        });

        if (!subject) {
            return res.status(404).json({
                success: false,
                message: "Subject not found",
            });
        }

        res.status(200).json({
            success: true,
            message: "Subject retrieved successfully",
            data: subject,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

exports.updateSubject = async (req, res) => {
    try {
        const { id } = req.params;
        const institute_id = req.user.institute_id;
        const { name, code, class_id, faculty_id, description } = req.body;

        const subject = await Subject.findOne({
            where: { id, institute_id },
        });

        if (!subject) {
            return res.status(404).json({
                success: false,
                message: "Subject not found",
            });
        }

        await subject.update({
            name: name || subject.name,
            code: code || subject.code,
            class_id: class_id || subject.class_id,
            faculty_id: faculty_id || subject.faculty_id,
            description: description || subject.description,
        });

        res.status(200).json({
            success: true,
            message: "Subject updated successfully",
            data: subject,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

exports.deleteSubject = async (req, res) => {
    try {
        const { id } = req.params;
        const institute_id = req.user.institute_id;

        const subject = await Subject.findOne({
            where: { id, institute_id },
        });

        if (!subject) {
            return res.status(404).json({
                success: false,
                message: "Subject not found",
            });
        }

        await subject.destroy();

        res.status(200).json({
            success: true,
            message: "Subject deleted successfully",
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

module.exports = exports;
