/**
 * Fees Controller
 * Handles fee structure and payment tracking
 */

const { FeesStructure, Payment, Student, User } = require("../models");
const { Op } = require("sequelize");

exports.createFeeStructure = async (req, res) => {
    try {
        const { class_id, fee_type, amount, due_date, description } = req.body;
        const institute_id = req.user.institute_id;

        const feeStructure = await FeesStructure.create({
            institute_id,
            class_id,
            fee_type,
            amount,
            due_date,
            description,
        });

        res.status(201).json({
            success: true,
            message: "Fee structure created successfully",
            data: feeStructure,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

exports.getAllFeeStructures = async (req, res) => {
    try {
        const { class_id } = req.query;
        const institute_id = req.user.institute_id;

        const whereClause = { institute_id };
        if (class_id) whereClause.class_id = class_id;

        const feeStructures = await FeesStructure.findAll({
            where: whereClause,
            order: [["due_date", "ASC"]],
        });

        res.status(200).json({
            success: true,
            message: "Fee structures retrieved successfully",
            data: feeStructures,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

exports.recordPayment = async (req, res) => {
    try {
        const { student_id, amount, payment_method, transaction_id, payment_date } = req.body;
        const institute_id = req.user.institute_id;

        const payment = await Payment.create({
            institute_id,
            student_id,
            amount,
            payment_method,
            transaction_id,
            payment_date: payment_date || new Date(),
            status: "completed",
        });

        res.status(201).json({
            success: true,
            message: "Payment recorded successfully",
            data: payment,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

exports.getStudentPayments = async (req, res) => {
    try {
        const { student_id } = req.params;
        const institute_id = req.user.institute_id;

        const payments = await Payment.findAll({
            where: { student_id, institute_id },
            order: [["payment_date", "DESC"]],
        });

        const totalPaid = payments.reduce((sum, payment) => sum + parseFloat(payment.amount), 0);

        res.status(200).json({
            success: true,
            message: "Student payments retrieved successfully",
            data: {
                payments,
                total_paid: totalPaid,
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
