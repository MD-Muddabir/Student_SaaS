const express = require("express");
const router = express.Router();
const path = require("path");

const verifyToken = require("../middlewares/auth.middleware");

const { Invoice } = require("../models");

router.get("/", verifyToken, async (req, res) => {
    try {
        const institute_id = req.user.institute_id;
        const invoices = await Invoice.findAll({
            where: { institute_id },
            order: [["createdAt", "DESC"]]
        });
        res.status(200).json({ success: true, data: invoices });
    } catch (error) {
        console.error("Error fetching invoices:", error);
        res.status(500).json({ success: false, message: error.message });
    }
});

router.get("/download/:fileName", verifyToken, (req, res) => {
    const filePath = path.join(
        __dirname,
        `../uploads/invoices/${req.params.fileName}`
    );

    res.download(filePath);
});

module.exports = router;
