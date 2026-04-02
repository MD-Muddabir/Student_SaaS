/**
 * Database Configuration
 * Sequelize instance for MySQL connection
 * Uses environment variables for flexibility across environments
 */

const { Sequelize } = require("sequelize");
require("dotenv").config();

// Initialize Sequelize with environment variables
const sequelize = new Sequelize(
    process.env.DB_NAME || "student_saas",          // ✅ change default
    process.env.DB_USER || "root",
    process.env.DB_PASSWORD,
    {
        host: process.env.DB_HOST || "localhost",              // ❌ no localhost fallback
        port: process.env.DB_PORT || 3306,
        dialect: "mysql",
        logging: process.env.NODE_ENV === "production" ? false : console.log,  // ✅ Show logs in dev, hide in prod

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

// Test connection on startup
sequelize.authenticate()
    .then(() => console.log("✅ Database connected successfully"))
    .catch(err => console.error("❌ Database connection failed:", err.message));

module.exports = sequelize;
