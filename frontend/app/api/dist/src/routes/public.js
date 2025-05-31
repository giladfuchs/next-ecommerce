"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const db_1 = require("../lib/db");
const entities_1 = require("../lib/entities");
const service_1 = require("../lib/service");
const router = (0, express_1.Router)();
// Submit order using cart data as-is (no price validation against DB)
router.post("/checkout", (0, service_1.withErrorHandler)(async (req, res) => {
    const { name, email, phone, cart } = req.body;
    const order = new entities_1.Order();
    order.name = name;
    order.email = email;
    order.phone = phone;
    if (cart && Object.keys(cart).length !== 0) {
        order.totalQuantity = cart.totalQuantity;
        order.cost = cart.cost;
        order.items = cart.lines.map((item) => {
            const orderItem = new entities_1.OrderItem();
            orderItem.productId = item.productId;
            orderItem.handle = item.handle;
            orderItem.title = item.title;
            orderItem.imageUrl = item.imageUrl;
            orderItem.imageAlt = item.imageAlt;
            orderItem.quantity = item.quantity;
            orderItem.unitAmount = item.unitAmount;
            orderItem.totalAmount = item.totalAmount;
            return orderItem;
        });
    }
    const savedOrder = await db_1.DB.getRepository(entities_1.Order).save(order);
    if (process.env.SEND_EMAIL_WHATSAPP === "true") {
        await (0, service_1.sendOrderConfirmationEmail)(savedOrder);
        await (0, service_1.sendAdminWhatsApp)(savedOrder.id);
    }
    res.status(201).json(savedOrder);
}));
router.get("/data", (0, service_1.withErrorHandler)(async (req, res) => {
    const [products, categories] = await Promise.all([
        db_1.DB.getRepository(entities_1.Product).find({
            relations: ["images"],
            order: {
                updatedAt: "DESC",
                images: {
                    position: "ASC",
                },
            },
        }),
        db_1.DB.getRepository(entities_1.Category).find({
            order: { position: "ASC" },
        }),
    ]);
    const categories_map_id_handle = Object.fromEntries(categories.map((c) => [c.id, c.handle]));
    const formatted_products = products.map((product) => ({
        ...product,
        category: categories_map_id_handle[product.category_id],
        featuredImage: product.images[0],
    }));
    res.json({ products: formatted_products, categories });
}));
router.post("/login", (0, service_1.withErrorHandler)(async (req, res) => {
    const { username, password } = req.body;
    const user = await db_1.DB.getRepository(entities_1.User).findOneBy({ username });
    if (!user) {
        return res.status(401).json({ error: "Invalid credentials" });
    }
    const isMatch = await bcryptjs_1.default.compare(password, user.password);
    if (!isMatch) {
        return res.status(401).json({ error: "Invalid credentials" });
    }
    const token = jsonwebtoken_1.default.sign({ userId: user.id, username: user.username }, process.env.JWT_SECRET, { expiresIn: "8d" });
    res.json({ message: "Login successful", token });
}));
exports.default = router;
//# sourceMappingURL=public.js.map