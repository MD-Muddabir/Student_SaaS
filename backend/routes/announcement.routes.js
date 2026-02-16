/**
 * Announcement Routes
 */

const express = require("express");
const router = express.Router();
const announcementController = require("../controllers/announcement.controller");
const verifyToken = require("../middlewares/auth.middleware");
const allowRoles = require("../middlewares/role.middleware");

router.post("/", verifyToken, allowRoles("admin", "faculty"), announcementController.createAnnouncement);
router.get("/", verifyToken, announcementController.getAllAnnouncements);
router.delete("/:id", verifyToken, allowRoles("admin"), announcementController.deleteAnnouncement);

module.exports = router;
