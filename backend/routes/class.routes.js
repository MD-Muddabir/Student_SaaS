/**
 * Class Routes
 * Defines API endpoints for class management
 */

const express = require("express");
const router = express.Router();
const classController = require("../controllers/class.controller");
const verifyToken = require("../middlewares/auth.middleware");
const allowRoles = require("../middlewares/role.middleware");

router.post("/", verifyToken, allowRoles("admin"), classController.createClass);
router.get("/", verifyToken, allowRoles("admin", "faculty"), classController.getAllClasses);
router.get("/:id", verifyToken, allowRoles("admin", "faculty"), classController.getClassById);
router.put("/:id", verifyToken, allowRoles("admin"), classController.updateClass);
router.delete("/:id", verifyToken, allowRoles("admin"), classController.deleteClass);

module.exports = router;
