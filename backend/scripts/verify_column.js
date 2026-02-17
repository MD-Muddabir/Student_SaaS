const fs = require('fs');
const { sequelize } = require('../models');

async function check() {
    try {
        const [results] = await sequelize.query("SHOW COLUMNS FROM Subscriptions");
        const columns = results.map(r => r.Field);
        fs.writeFileSync('db_check_result.txt', JSON.stringify(columns, null, 2));
        console.log('Done');
    } catch (error) {
        fs.writeFileSync('db_check_result.txt', 'Error: ' + error.message);
    } finally {
        await sequelize.close();
    }
}

check();
