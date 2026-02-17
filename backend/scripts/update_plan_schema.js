const { sequelize } = require('../models');

async function checkPlanColumn() {
    try {
        await sequelize.authenticate();
        const [results] = await sequelize.query("SHOW COLUMNS FROM Plans LIKE 'razorpay_plan_id'");
        if (results.length === 0) {
            console.log("Column missing. Adding razorpay_plan_id...");
            try {
                await sequelize.query("ALTER TABLE Plans ADD COLUMN razorpay_plan_id VARCHAR(255)");
                console.log("✅ Column added.");
            } catch (e) {
                console.error("❌ Failed to add column: " + e.message);
            }
        } else {
            console.log("✅ razorpay_plan_id exists.");
        }
    } catch (e) {
        console.error("Error: " + e.message);
    } finally {
        await sequelize.close();
    }
}

checkPlanColumn();
