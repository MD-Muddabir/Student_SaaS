const { Subscription } = require("../models");
const { Op } = require("sequelize");

async function checkSubscription(req, res, next) {
    // Super admin bypasses this check
    if (req.user.role === 'super_admin') return next();

    try {
        const sub = await Subscription.findOne({
            where: {
                institute_id: req.user.institute_id,
                payment_status: 'paid',
                end_date: { [Op.gte]: new Date() },  // not expired
            }
        });

        if (!sub) {
            return res.status(402).json({   // 402 = Payment Required
                success: false,
                code: 'SUBSCRIPTION_EXPIRED',
                message: 'Your subscription has expired or no active plan found. Please renew to continue.',
                renew_url: '/subscription'
            });
        }

        req.subscription = sub;  // available in controllers
        next();
    } catch (error) {
        console.error("Subscription Check Error:", error);
        return res.status(500).json({ success: false, message: "Internal Server Error verifying subscription" });
    }
}

module.exports = checkSubscription;
