const app = require("./app");
require("./utils/cron");

const PORT = process.env.PORT || 5000;
const HOST = process.env.HOST || "0.0.0.0";

app.listen(PORT, HOST, () => {
    console.log(`✅ Server running on http://${HOST}:${PORT}`);
    console.log(`📱 Mobile devices can reach backend at http://172.20.10.3:${PORT}/api`);
});
