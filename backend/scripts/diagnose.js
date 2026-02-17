const { sequelize, Institute, Subscription, Plan, Student, Faculty } = require('../models');
const { Op } = require("sequelize");

async function diagnose() {
    try {
        await sequelize.authenticate();
        console.log('✅ Database Connected');

        // 1. Check Institute Count
        try {
            const count = await Institute.count();
            console.log(`✅ Institute Count: ${count}`);
        } catch (e) {
            console.error(`❌ Institute Count Failed: ${e.message}`);
        }

        // 2. Check Student Count
        try {
            const count = await Student.count();
            console.log(`✅ Student Count: ${count}`);
        } catch (e) {
            console.error(`❌ Student Count Failed: ${e.message}`);
        }

        // 3. Check Faculty Count
        try {
            const count = await Faculty.count();
            console.log(`✅ Faculty Count: ${count}`);
        } catch (e) {
            console.error(`❌ Faculty Count Failed: ${e.message}`);
        }

        // 4. Check Subscriptions with Plan
        try {
            const subs = await Subscription.findAll({
                include: [{ model: Plan }],
                limit: 1
            });
            console.log(`✅ Subscriptions Fetch Success. Found: ${subs.length}`);
        } catch (e) {
            console.error(`❌ Subscriptions Fetch Failed: ${e.message}`);
        }

        // 5. Check Institute List with Plan and Subscription (The one used in Institutes page)
        try {
            const institutes = await Institute.findAll({
                include: [
                    {
                        model: Subscription,
                    },
                    {
                        model: Plan,
                    }
                ],
                limit: 1
            });
            console.log(`✅ Institute List Fetch Success. Found: ${institutes.length}`);
            if (institutes.length > 0) {
                console.log('Sample Institute:', JSON.stringify(institutes[0].toJSON(), null, 2));
            }
        } catch (e) {
            console.error(`❌ Institute List Fetch Failed: ${e.message}`);
        }

    } catch (error) {
        console.error('Main Error:', error);
    } finally {
        await sequelize.close();
    }
}

diagnose();
