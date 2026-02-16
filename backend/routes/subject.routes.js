/**
 * Subject Routes
 */

const express = require("express");
const router = express.Router();
const subjectController = require("../controllers/subject.controller");
const verifyToken = require("../middlewares/auth.middleware");
const allowRoles = require("../middlewares/role.middleware");

router.post("/", verifyToken, allowRoles("admin"), subjectController.createSubject);
router.get("/", verifyToken, allowRoles("admin", "faculty"), subjectController.getAllSubjects);
router.get("/:id", verifyToken, allowRoles("admin", "faculty"), subjectController.getSubjectById);
router.put("/:id", verifyToken, allowRoles("admin"), subjectController.updateSubject);
router.delete("/:id", verifyToken, allowRoles("admin"), subjectController.deleteSubject);

module.exports = router;
