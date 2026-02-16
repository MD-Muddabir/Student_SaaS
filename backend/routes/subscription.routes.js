/**
 * Subscription Routes
 */

const express = require("express");
const router = express.Router();
const subscriptionController = require("../controllers/subscription.controller");
const verifyToken = require("../middlewares/auth.middleware");
const allowRoles = require("../middlewares/role.middleware");

router.post("/", verifyToken, allowRoles("super_admin", "admin"), subscriptionController.createSubscription);
router.get("/", verifyToken, allowRoles("super_admin"), subscriptionController.getAllSubscriptions);
router.patch("/:id/status", verifyToken, allowRoles("super_admin"), subscriptionController.updateSubscriptionStatus);

module.exports = router;
