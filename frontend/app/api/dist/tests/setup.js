"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
require("reflect-metadata");
const db_1 = require("../src/lib/db");
process.env.NODE_ENV = "test";
(0, vitest_1.beforeAll)(async () => {
    if (!db_1.DB.isInitialized) {
        await db_1.DB.initialize();
        console.log("✅ Test DB initialized (from setup)");
    }
});
(0, vitest_1.beforeEach)(async () => { });
//# sourceMappingURL=setup.js.map