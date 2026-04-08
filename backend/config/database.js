/**
 * Database Configuration
 * Sequelize instance for PostgreSQL (Neon) connection
 * Uses environment variables for flexibility across environments
 */

const { Sequelize } = require("sequelize");
require("dotenv").config();

const dbUrl = process.env.DATABASE_URL;

if (!dbUrl) {
    console.error("❌ DATABASE_URL is missing in environment variables.");
    process.exit(1);
}

const isLocal = dbUrl.includes("localhost") || dbUrl.includes("127.0.0.1");

console.log(`🗄️  Connecting to DB via PostgreSQL...`);
console.log(`🔒  SSL: ${isLocal ? "disabled (localhost)" : "enabled"}`);

// Initialize Sequelize with environment variables
const sequelize = new Sequelize(dbUrl, {
    dialect: "postgres",

    // Only log slow queries in development
    logging: process.env.NODE_ENV === "development"
        ? (sql, timing) => {
            if (timing && timing > 500) {
                console.warn(`🐌 SLOW QUERY (${timing}ms):`, sql.substring(0, 200));
            }
        }
        : false,
    benchmark: process.env.NODE_ENV === "development",

    // Optimized Connection Pooling for Serverless (Neon)
    pool: {
        max: 5,
        min: 0,
        acquire: 60000,
        idle: 20000,
        evict: 15000,
    },

    // Retry Logic for Neon Cold Starts & Intermittent DNS issues
    retry: {
        match: [
            /ENOTFOUND/,         // Catches getaddrinfo ENOTFOUND
            /EAI_AGAIN/,         // DNS timeout
            /ECONNRESET/,
            /ECONNREFUSED/,
            /ETIMEDOUT/,
            /SequelizeConnection/,
            /SequelizeHost/,
            /TimeoutError/
        ],
        name: 'query',
        max: 5, // Try up to 5 times
        backoffBase: 1000, // Initial backoff 1s
        backoffExponent: 1.5, // 1s, 1.5s, 2.25s, etc.
    },

    // SSL Configuration for Neon
    dialectOptions: {
        connectTimeout: 60000,
        keepAlive: true,
        statement_timeout: 60000, // 60s
        idle_in_transaction_session_timeout: 60000, // 60s
        ...(isLocal ? {} : {
            ssl: {
                require: true,
                rejectUnauthorized: false,
            }
        })
    },

    define: {
        timestamps: true,
        underscored: true,
        paranoid: false,
    },
});

// Connection health check on startup
sequelize.authenticate()
    .then(() => console.log("✅ PostgreSQL DB Pool Ready"))
    .catch(err => console.error("❌ DB Pool Failed:", err.message));

module.exports = sequelize;
