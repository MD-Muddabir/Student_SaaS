// Test file to identify the problematic module
console.log("Testing app.js import...");

try {
    const app = require("./app");
    console.log("✅ App loaded successfully");
} catch (error) {
    console.error("❌ Error loading app:", error.message);
    console.error(error.stack);
}
