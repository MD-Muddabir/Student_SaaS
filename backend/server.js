const { app, syncDatabase } = require("./app");
require("./utils/cron");

const PORT = process.env.PORT || 8080;
const HOST = "0.0.0.0";

// Initialize database then start server
const startServer = async () => {
    try {
        // Sync database first
        await syncDatabase();

        // Start server only after database is ready
        app.listen(PORT, HOST, () => {
            console.log(`✅ Server running on http://${HOST}:${PORT}`);
            console.log(`📱 Mobile devices can reach backend at http://[IP_ADDRESS]:${PORT}/api`);
        });
    } catch (error) {
        console.error("❌ Failed to start server:", error.message);
        process.exit(1); // Exit here instead - Railway will restart
    }
};

// Start the server
startServer();

// Handle crashes
process.on("uncaughtException", (err) => {
    console.error("❌ Uncaught Exception:", err.message);
    process.exit(1);
});

process.on("unhandledRejection", (err) => {
    console.error("❌ Unhandled Rejection:", err.message);
    process.exit(1);
});