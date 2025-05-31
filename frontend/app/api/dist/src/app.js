"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const routes_1 = __importDefault(require("./routes"));
const db_1 = require("./lib/db");
const app = (0, express_1.default)();
const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(",");
app.use((0, cors_1.default)({
    origin: allowedOrigins,
    credentials: true,
}));
app.use(express_1.default.json());
app.use(db_1.initDBMiddleware);
app.use("/", routes_1.default);
exports.default = app;
//# sourceMappingURL=app.js.map