const express = require("express");
const router = express.Router();
const verifyToken = require("../middlewares/auth.middleware");
const allowRoles = require("../middlewares/role.middleware");
const ctrl = require("../controllers/manager.controller");

// Manager dashboard stats (safe – no revenue/profit)
router.get(
    "/stats",
    verifyToken,
    allowRoles("admin", "manager"),
    ctrl.getManagerDashboardStats
);

// Manager Finance Dashboard — LIMITED data only (no revenue/P&L/salary totals)
// Only managers with 'finance' permission in their permissions array can access this.
// Backend enforces the restriction — frontend hiding alone is not sufficient.
router.get(
    "/finance-dashboard",
    verifyToken,
    allowRoles("admin", "manager"),
    ctrl.getManagerFinanceDashboard
);

module.exports = router;
