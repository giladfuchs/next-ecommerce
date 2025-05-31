"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DB = void 0;
exports.initDBMiddleware = initDBMiddleware;
const dotenv_1 = __importDefault(require("dotenv"));
const typeorm_1 = require("typeorm");
const entities_1 = require("./entities");
const subscribers_1 = require("./subscribers");
dotenv_1.default.config();
const entities = [entities_1.Product, entities_1.Category, entities_1.ProductImage, entities_1.Order, entities_1.OrderItem, entities_1.User];
const isTest = process.env.NODE_ENV === "test";
const isSeed = process.env.SEED === "true";
const options = isSeed || isTest
    ? {
        type: "postgres",
        host: "localhost",
        port: 5433,
        username: "test",
        password: "test",
        database: "ecommerce_test",
        synchronize: true,
        logging: false,
        entities,
        subscribers: [subscribers_1.ProductSubscriber, subscribers_1.OrderSubscriber],
    }
    : {
        type: "postgres",
        host: process.env.DB_HOST,
        port: parseInt(process.env.DB_PORT),
        username: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        synchronize: true,
        logging: false,
        entities,
        subscribers: [subscribers_1.ProductSubscriber, subscribers_1.OrderSubscriber],
    };
exports.DB = new typeorm_1.DataSource(options);
let initialized = false;
async function initDBMiddleware(req, res, next) {
    try {
        if (!initialized) {
            await exports.DB.initialize();
            initialized = true;
            console.log("✅ DB initialized (via middleware)");
        }
        next();
    }
    catch (err) {
        console.error("❌ DB initialization error:", err);
        res.status(500).json({ error: "Database initialization failed" });
    }
}
//# sourceMappingURL=db.js.map