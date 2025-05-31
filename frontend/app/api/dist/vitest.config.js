"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const config_1 = require("vitest/config");
exports.default = (0, config_1.defineConfig)({
    test: {
        globals: true,
        environment: "node",
        setupFiles: "./tests/setup.ts", // optional
    },
});
//# sourceMappingURL=vitest.config.js.map