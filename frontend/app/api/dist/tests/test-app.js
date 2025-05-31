"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const routes_1 = __importDefault(require("../src/routes"));
const app = (0, express_1.default)();
app.use((0, cors_1.default)({ origin: "*", credentials: true }));
app.use(express_1.default.json());
app.use("/", routes_1.default);
exports.default = app;
//# sourceMappingURL=test-app.js.map