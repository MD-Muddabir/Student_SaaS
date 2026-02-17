const { sequelize } = require('../models');

async function checkColumn() {
    try {
        await sequelize.authenticate();
        console.log('Connected to database.');

        const [results, metadata] = await sequelize.query("SHOW COLUMNS FROM Subscriptions LIKE 'amount_paid'");

        if (results.length > 0) {
            console.log('✅ Column amount_paid EXISTS.');
        } else {
            console.log('❌ Column amount_paid DOES NOT EXIST. Attempting to add...');
            try {
                await sequelize.query('ALTER TABLE Subscriptions ADD COLUMN amount_paid DECIMAL(10, 2);');
                console.log('✅ Successfully added amount_paid column.');
            } catch (err) {
                console.error('❌ Failed to add column:', err.message);
            }
        }
    } catch (error) {
        console.error('Database errors:', error);
    } finally {
        await sequelize.close();
    }
}

checkColumn();
