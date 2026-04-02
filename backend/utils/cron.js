const cron = require("node-cron");
const { Institute, Subscription } = require("../models");
const { Op } = require("sequelize");
const emailService = require("../services/email.service");

cron.schedule("0 0 * * *", async () => {
    console.log("Running daily subscription check...");

    const today = new Date();

    const expiredSubs = await Subscription.findAll({
        where: {
            end_date: { [Op.lt]: today },
            payment_status: "paid"
        }
    });

    for (const sub of expiredSubs) {
        await sub.update({ payment_status: "unpaid" });

        await Institute.update(
            { status: "inactive" },
            { where: { id: sub.institute_id } }
        );
    }

    console.log(`Expired ${expiredSubs.length} subscriptions.`);
});

cron.schedule("0 9 * * *", async () => {
    const warningDate = new Date();
    warningDate.setDate(warningDate.getDate() + 3);

    const expiringSubs = await Subscription.findAll({
        where: {
            end_date: { [Op.eq]: warningDate.toISOString().split('T')[0] },
            payment_status: "paid"
        }
    });

    for (const sub of expiringSubs) {
        const institute = await Institute.findByPk(sub.institute_id);
        if (institute) {
            await emailService.sendEmail(
                institute.email,
                "Subscription Expiring Soon",
                `
                <h3>Your Subscription is Expiring</h3>
                <p>Your plan will expire on ${sub.end_date}</p>
                <p>Please renew to avoid service interruption.</p>
                `
            );
        }
    }
    console.log(`Sent ${expiringSubs.length} subscription warnings.`);
});

// ─────────────────────────────────────────────────────────────────
// PHASE 6 — BIOMETRIC ABSENT DETECTION
// Runs every day at 11:00 PM — marks absent for enrolled students
// who never punched in today.
// ─────────────────────────────────────────────────────────────────
cron.schedule("0 23 * * *", async () => {
    console.log("🔐 Running biometric absent detection...");
    try {
        const { BiometricSettings, Institute } = require("../models");
        const biometricCtrl = require("../controllers/biometric.controller");

        // Get all institutes with biometric settings
        const settings = await BiometricSettings.findAll();
        const today = new Date().toISOString().split("T")[0];

        for (const setting of settings) {
            const marked = await biometricCtrl.markAbsentStudents(setting.institute_id, today);
            if (marked > 0) {
                console.log(`   ✓ Institute ${setting.institute_id}: ${marked} absent records created`);
            }
        }
        console.log("✅ Biometric absent detection complete.");
    } catch (err) {
        console.error("❌ Absent detection cron error:", err.message);
    }
});