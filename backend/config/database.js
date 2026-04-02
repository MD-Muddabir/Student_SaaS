/**
 * Database Configuration
 * Sequelize instance for MySQL connection
 * Uses environment variables for flexibility across environments
 */

const { Sequelize } = require("sequelize");
require("dotenv").config();

// Log which DB we are connecting to (helps debug Railway issues)
const dbHost = process.env.DB_HOST || "localhost";
const dbName = process.env.DB_NAME || "student_saas";
const dbUser = process.env.DB_USER || "root";
const dbPort = parseInt(process.env.DB_PORT || "3306", 10);

console.log(`🗄️  Connecting to DB: ${dbUser}@${dbHost}:${dbPort}/${dbName}`);

// Initialize Sequelize with environment variables
const sequelize = new Sequelize(
    dbName,
    dbUser,
    process.env.DB_PASSWORD,
    {
        host: dbHost,
        port: dbPort,
        dialect: "mysql",
        logging: false,
        pool: {
            max: 10,
            min: 0,
            acquire: 60000,
            idle: 10000,
        },
        define: {
            timestamps: true,    // Automatically add created_at and updated_at
            underscored: true,   // Use snake_case to match database columns
        },
    }
);

module.exports = sequelize;
