const fs = require('fs');
const { sequelize, Institute, Subscription, Plan, Student, Faculty } = require('../models');
const { Op } = require("sequelize");

async function diagnose() {
    let output = '';
    const log = (msg) => {
        console.log(msg);
        output += msg + '\n';
    };

    try {
        await sequelize.authenticate();
        log('✅ Database Connected');

        // 1. Check Institute Count
        try {
            const count = await Institute.count();
            log(`✅ Institute Count: ${count}`);
        } catch (e) {
            log(`❌ Institute Count Failed: ${e.message}`);
        }

        // 2. Check Student Count
        try {
            const count = await Student.count();
            log(`✅ Student Count: ${count}`);
        } catch (e) {
            log(`❌ Student Count Failed: ${e.message}`);
        }

        // 3. Check Faculty Count
        try {
            const count = await Faculty.count();
            log(`✅ Faculty Count: ${count}`);
        } catch (e) {
            log(`❌ Faculty Count Failed: ${e.message}`);
        }

        // 4. Check Subscriptions with Plan
        try {
            const subs = await Subscription.findAll({
                include: [{ model: Plan }],
                limit: 1
            });
            log(`✅ Subscriptions Fetch Success. Found: ${subs.length}`);
        } catch (e) {
            log(`❌ Subscriptions Fetch Failed: ${e.message}`);
        }

        // 5. Check Institute List with Plan and Subscription (The one used in Institutes page)
        // Mimic EXACTLY the controller code
        try {
            const whereClause = {};
            const { rows } = await Institute.findAndCountAll({
                where: whereClause,
                limit: 5,
                offset: 0,
                order: [["createdAt", "DESC"]],
                include: [
                    {
                        model: Subscription,
                        attributes: ["plan_id", "subscription_start", "subscription_end", "payment_status"],
                    },
                    {
                        model: Plan,
                        attributes: ["name"]
                    }
                ],
            });
            log(`✅ Institute List Fetch Success. Found: ${rows.length}`);
            if (rows.length > 0) {
                log('Sample Institute: ' + JSON.stringify(rows[0].toJSON(), null, 2));
            }
        } catch (e) {
            log(`❌ Institute List Fetch Failed: ${e.message}`);
            log(e.stack);
        }

    } catch (error) {
        log('Main Error: ' + error.message);
    } finally {
        await sequelize.close();
        fs.writeFileSync('backend/scripts/diagnose_v2_result.txt', output);
    }
}

diagnose();
