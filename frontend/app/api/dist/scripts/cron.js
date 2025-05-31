"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
const db_1 = require("../src/lib/db");
const mock_data_1 = require("./mock_data");
db_1.DB.initialize()
    .then(async () => {
    // await delete_models();
    await (0, mock_data_1.importMockData)();
    process.exit();
})
    .catch((err) => {
    console.error("❌ Failed to run seed script", err);
    process.exit(1);
});
//# sourceMappingURL=cron.js.map