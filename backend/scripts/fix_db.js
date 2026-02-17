const { sequelize } = require('../models');

async function fixDatabase() {
    try {
        await sequelize.authenticate();
        console.log('Connected to database.');

        // Check if column exists or just try to add it. 
        // If it exists, it will throw an error which we can catch/ignore.
        try {
            await sequelize.query('ALTER TABLE Subscriptions ADD COLUMN amount_paid DECIMAL(10, 2);');
            console.log('Successfully added amount_paid column to Subscriptions table.');
        } catch (err) {
            if (err.original && err.original.code === 'ER_DUP_FIELDNAME') {
                console.log('Column amount_paid already exists.');
            } else {
                console.error('Error adding column:', err.message);
            }
        }

    } catch (error) {
        console.error('Database errors:', error);
    } finally {
        await sequelize.close();
    }
}

fixDatabase();
