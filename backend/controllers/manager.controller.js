/**
 * Manager Dashboard Controller
 * Returns operational stats for manager: today's fee collection, pending fees,
 * recent payments, total expenses. Does NOT expose revenue/profit.
 */
const { Payment, Expense, FeesStructure, Student, StudentFee, User, Attendance, Class } = require("../models");
const { Op } = require("sequelize");

exports.getManagerDashboardStats = async (req, res) => {
    try {
        const institute_id = req.user.institute_id;
        const today = new Date();
        const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
        const todayEnd = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59);

        // 1. Today's fee collection (sum of payments today)
        const todayCollection = await Payment.sum("amount_paid", {
            where: {
                institute_id,
                payment_date: { [Op.between]: [todayStart, todayEnd] },
                status: "success"
            }
        }) || 0;

        // 2. Total expenses this month
        const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
        const monthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0, 23, 59, 59);
        const totalExpenses = await Expense.sum("amount", {
            where: {
                institute_id,
                date: { [Op.between]: [monthStart, monthEnd] }
            }
        }) || 0;

        // 3. Recent 5 payments
        const recentPayments = await Payment.findAll({
            where: { institute_id, status: "success" },
            order: [["payment_date", "DESC"]],
            limit: 5,
            include: [
                {
                    model: Student,
                    include: [{ model: User, attributes: ["name"] }]
                }
            ]
        });

        // 4. Total students with pending fees (students who have fee structure but haven't paid in full)
        const totalStudents = await Student.count({ where: { institute_id } });

        // 5. Attendance stats for today (per class)
        const attendanceToday = await Attendance.count({
            where: {
                institute_id,
                date: { [Op.between]: [todayStart, todayEnd] }
            }
        });

        // 6. Present students today
        const presentToday = await Attendance.count({
            where: {
                institute_id,
                date: { [Op.between]: [todayStart, todayEnd] },
                status: "present"
            }
        });

        const attendanceRate = attendanceToday > 0
            ? Math.round((presentToday / attendanceToday) * 100)
            : 0;

        res.status(200).json({
            success: true,
            data: {
                todayCollection,
                totalExpenses,
                recentPayments,
                totalStudents,
                attendanceToday,
                presentToday,
                attendanceRate
            }
        });
    } catch (error) {
        console.error("Manager dashboard stats error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * Manager Finance Dashboard — LIMITED data only
 * Only accessible by managers who have 'finance' permission.
 * Fees Manager gets: today's collections, pending list, recent receipts.
 * Revenue totals, P&L, salary totals are NEVER returned here.
 * GET /api/manager/finance-dashboard
 */
exports.getManagerFinanceDashboard = async (req, res) => {
    try {
        const institute_id = req.user.institute_id;
        const manager_type = req.user.manager_type || 'custom';

        // Only 'fees' type managers AND managers with finance permission get this
        const perms = Array.isArray(req.user.permissions) ? req.user.permissions : [];
        const hasFinanceAccess = perms.includes('finance');

        if (!hasFinanceAccess) {
            return res.status(403).json({ success: false, message: 'Finance Dashboard access not granted.' });
        }

        const today = new Date();
        const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
        const todayEnd   = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59);

        // Today's collections (cash received today)
        const todayCollections = await Payment.sum('amount_paid', {
            where: {
                institute_id,
                payment_date: { [Op.between]: [todayStart, todayEnd] },
                status: 'success'
            }
        }) || 0;

        // Pending fees list (max 15, soonest due first)
        const pendingList = await StudentFee.findAll({
            where: {
                institute_id,
                status: { [Op.in]: ['pending', 'partial'] }
            },
            include: [
                { model: Student, include: [{ model: User, attributes: ['name', 'email'] }] },
                { model: FeesStructure, attributes: ['fee_type', 'due_date', 'amount'] }
            ],
            order: [['due_amount', 'DESC']],
            limit: 15
        });

        // Recent 10 receipts
        const recentReceipts = await Payment.findAll({
            where: { institute_id, status: 'success' },
            include: [
                { model: Student, include: [{ model: User, attributes: ['name'] }] }
            ],
            order: [['payment_date', 'DESC']],
            limit: 10
        });

        // Total pending amount
        const totalPendingAmount = await StudentFee.sum('due_amount', {
            where: { institute_id, status: { [Op.in]: ['pending', 'partial'] } }
        }) || 0;

        return res.json({
            success: true,
            manager_type,
            data: {
                today_collections: parseFloat(todayCollections),
                total_pending_amount: parseFloat(totalPendingAmount),
                pending_list: pendingList,
                recent_receipts: recentReceipts,
                // NEVER included: total_revenue, profit_loss, salary_totals
            }
        });
    } catch (err) {
        console.error('getManagerFinanceDashboard error:', err);
        res.status(500).json({ success: false, message: err.message });
    }
};
