"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = __importDefault(require("./auth"));
const public_1 = __importDefault(require("./public"));
const service_1 = require("../lib/service");
const router = (0, express_1.Router)();
router.use("/", public_1.default);
router.use("/auth", service_1.authMiddleware, auth_1.default);
exports.default = router;
//# sourceMappingURL=index.js.map