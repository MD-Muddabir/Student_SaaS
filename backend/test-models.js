// Test file to identify the problematic module
console.log("Testing models import...");

try {
    const models = require("./models");
    console.log("✅ Models loaded successfully");
    console.log("Available models:", Object.keys(models));
} catch (error) {
    console.error("❌ Error loading models:", error.message);
    console.error(error.stack);
}
