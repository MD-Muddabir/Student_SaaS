/**
 * Database Configuration
 * Sequelize instance for MySQL connection
 * Uses environment variables for flexibility across environments
 */

const { Sequelize } = require("sequelize");
require("dotenv").config();

// Initialize Sequelize with environment variables
const sequelize = new Sequelize(
    process.env.DB_NAME || "student_saas",
    process.env.DB_USER || "root",
    process.env.DB_PASSWORD || "tiger",
    {
        host: process.env.DB_HOST || "localhost",
        port: process.env.DB_PORT || 3306,
        dialect: process.env.DB_DIALECT || "mysql",
        logging: false, // Set to console.log for debugging
        pool: {
            max: 10,
            min: 0,
            acquire: 30000,
            idle: 10000,
        },
        define: {
            timestamps: true, // Automatically add created_at and updated_at
            underscored: true, // Use snake_case to match database columns
        },
    }
);

module.exports = sequelize;
