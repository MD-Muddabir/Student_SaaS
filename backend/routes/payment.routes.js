const express = require("express");
const router = express.Router();
const controller = require("../controllers/payment.controller");
const verifyToken = require("../middlewares/auth.middleware");

// These routes require authentication as they are for a logged-in admin (even if institute is pending)
router.post("/initiate", verifyToken, controller.initiatePayment);
router.post("/verify", verifyToken, controller.verifyPayment);

// Phase 4: Student Fee Payments
router.post("/fees/create-order", verifyToken, controller.createFeeOrder);
router.post("/fees/verify", verifyToken, controller.verifyFeePayment);

module.exports = router;
