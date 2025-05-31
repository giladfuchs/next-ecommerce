"use strict";
// @ts-nocheck
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateUser = CreateUser;
require("reflect-metadata");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const entities_1 = require("../src/lib/entities");
const db_1 = require("../src/lib/db");
async function CreateUser(username, email, password) {
    await db_1.DB.initialize();
    const existing = await db_1.DB.getRepository(entities_1.User).findOneBy({ email });
    if (existing) {
        console.error("❌ Email already registered");
        process.exit(1);
    }
    const hashedPassword = await bcryptjs_1.default.hash(password, 10);
    const user = db_1.DB.getRepository(entities_1.User).create({
        username,
        email,
        password: hashedPassword,
    });
    await db_1.DB.getRepository(entities_1.User).save(user);
    console.log("✅ User registered");
    process.exit(0);
}
// const username = "admin";
// const email = "admin@admin.com";
// const password = "admin";
// CreateUser(username, email, password).catch((err) => {
//     console.error(err);
//     process.exit(1);
// });
//SEED=true pnpm tsx scripts/insert_user.ts
//# sourceMappingURL=insert_user.js.map