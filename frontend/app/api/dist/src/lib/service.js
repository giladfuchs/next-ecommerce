"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.findOrThrow = findOrThrow;
exports.authMiddleware = authMiddleware;
exports.withErrorHandler = withErrorHandler;
exports.handleImageUpload = handleImageUpload;
exports.handleReorderCategory = handleReorderCategory;
exports.generateOrderEmailHtml = generateOrderEmailHtml;
exports.sendOrderConfirmationEmail = sendOrderConfirmationEmail;
exports.sendAdminWhatsApp = sendAdminWhatsApp;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const sharp_1 = __importDefault(require("sharp"));
const path_1 = __importDefault(require("path"));
const blob_1 = require("@vercel/blob");
const nodemailer_1 = __importDefault(require("nodemailer"));
const util_1 = require("./util");
const db_1 = require("./db");
const entities_1 = require("./entities");
const modelMap = {
    [util_1.ModelType.product]: db_1.DB.getRepository(entities_1.Product),
    [util_1.ModelType.category]: db_1.DB.getRepository(entities_1.Category),
    [util_1.ModelType.order]: db_1.DB.getRepository(entities_1.Order),
};
async function findOrThrow(modelType, id, relations) {
    const repo = modelMap[modelType];
    const entity = await repo.findOne({
        where: { id },
        relations,
    });
    if (!entity) {
        throw new util_1.NotFoundError(`${modelType.charAt(0).toUpperCase() + modelType.slice(1)} not found`);
    }
    return entity;
}
function authMiddleware(req, res, next) {
    if (process.env.NODE_ENV === "test") {
        // Automatically authorize in test environment
        return next();
    }
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ error: "Unauthorized - missing token" });
    }
    const token = authHeader.split(" ")[1];
    try {
        jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
        next();
    }
    catch (err) {
        console.error("❌ Invalid token", err);
        return res.status(401).json({ error: "Unauthorized - invalid token" });
    }
}
function withErrorHandler(handler) {
    return async (req, res, next) => {
        try {
            await handler(req, res, next);
        }
        catch (error) {
            if (error instanceof Error && error.message === "no image") {
                return res
                    .status(400)
                    .json({ error: "Missing required field: images" });
            }
            if (error instanceof Error && error.message === "no cart items") {
                return res
                    .status(400)
                    .json({ error: "Order must contain at least one item" });
            }
            if (error?.name === "QueryFailedError" &&
                error?.code === "23505" &&
                typeof error?.detail === "string") {
                return res.status(400).json({
                    error: error.detail,
                });
            }
            if (error?.code === "23502" &&
                typeof error?.driverError?.column === "string") {
                return res.status(400).json({
                    error: `Missing required field: ${error.driverError.column}`,
                });
            }
            if (error?.name === "QueryFailedError" &&
                error?.code === "23502" &&
                typeof error?.driverError?.column === "string") {
                return res.status(500).json({
                    error: `Missing required field: ${error.driverError.column}`,
                });
            }
            // Handle invalid enum value (Postgres: 22P02)
            if (error?.name === "QueryFailedError" &&
                error?.code === "22P02" &&
                typeof error?.driverError?.message === "string") {
                return res.status(500).json({
                    error: error.driverError.message,
                });
            }
            // Handle NotFoundError (like "Order not found")
            if (error?.name === "NotFoundError") {
                return res.status(404).json({ error: error.message });
            }
            console.error("❌ Uncaught error in route:", error);
            res.status(500).json({ error: "Internal server error" });
        }
    };
}
async function handleImageUpload(req, res) {
    try {
        const file = req.file;
        if (!file) {
            res.status(400).json({ error: "No image uploaded" });
            return;
        }
        if (!file.mimetype.startsWith("image/")) {
            res.status(400).json({ error: "Only image files are allowed" });
            return;
        }
        const safeFileName = path_1.default.basename(file.originalname);
        const resizedBuffer = await (0, sharp_1.default)(file.buffer)
            .resize(500, 500, {
            fit: "cover",
            position: "top",
        })
            .withMetadata({ orientation: undefined })
            .jpeg({ quality: 80 })
            .toBuffer();
        const blob = await (0, blob_1.put)(`products/${safeFileName}`, resizedBuffer, {
            access: "public",
            allowOverwrite: true,
        });
        res.json({ url: blob.url });
    }
    catch (err) {
        console.error("❌ Upload error:", err);
        res.status(500).json({
            error: "Upload failed",
            message: err instanceof Error ? err.message : String(err),
        });
    }
}
async function handleReorderCategory(repo, saved) {
    const all = await repo.find({
        order: { position: "ASC" },
    });
    const filtered = all.filter((item) => item.id !== saved.id);
    const targetPos = Math.max(1, Math.min(saved.position ?? filtered.length + 1, filtered.length + 1));
    const updatedList = [];
    let inserted = false;
    for (let i = 0, pos = 1; i <= filtered.length; i++) {
        if (pos === targetPos && !inserted) {
            updatedList.push({ ...saved, position: pos++ });
            inserted = true;
        }
        if (i < filtered.length) {
            updatedList.push({ ...filtered[i], position: pos++ });
        }
    }
    await repo.save(updatedList);
    return updatedList.find((c) => c.id === saved.id);
}
let transporter = null;
function getTransporter() {
    if (!transporter)
        transporter = nodemailer_1.default.createTransport({
            host: "smtp.mailersend.net",
            port: 587,
            secure: false,
            auth: {
                user: process.env.MAILERSEND_SMTP_USER,
                pass: process.env.MAILERSEND_SMTP_PASS,
            },
        });
    return transporter;
}
function generateOrderEmailHtml(order) {
    const itemsHtml = order.items
        .map((item) => `
    <tr style="border-bottom: 1px solid #ddd; text-align: center;">
      <td style="padding: 8px;"><img src="${item.imageUrl}" alt="${item.imageAlt}" width="50" height="50" style="border-radius: 4px; object-fit: cover;" /></td>
      <td style="padding: 8px;">${item.title}</td>
      <td style="padding: 8px;">${item.quantity}</td>
      <td style="padding: 8px;">₪${item.unitAmount}</td>
      <td style="padding: 8px;"><strong>₪${item.totalAmount.toFixed(2)}</strong></td>
    </tr>
  `)
        .join("");
    return `
    <div dir="rtl" style="font-family: sans-serif; padding: 20px; max-width: 600px; margin: auto;">
      <h2 style="margin-bottom: 10px;">שלום ${order.name},</h2>
      <p style="margin: 0 0 20px 0;">ההזמנה שלך התקבלה בהצלחה.</p>

      <table cellpadding="0" cellspacing="0" style="width: 100%; border-collapse: collapse; font-size: 14px;">
        <thead style="background-color: #f5f5f5;">
          <tr style="text-align: center;">
            <th style="padding: 10px;">תמונה</th>
            <th style="padding: 10px;">מוצר</th>
            <th style="padding: 10px;">כמות</th>
            <th style="padding: 10px;">מחיר</th>
            <th style="padding: 10px;">סה"כ</th>
          </tr>
        </thead>
        <tbody>
          ${itemsHtml}
        </tbody>
      </table>

      <h3 style="margin-top: 20px; text-align: right;">סה"כ לתשלום: ₪${order.cost.toFixed(2)}</h3>
      <p style="text-align: right;">מספר הזמנה: <strong>#${order.id}</strong></p>
      <p style="text-align: right;">תודה שקנית אצלנו 💚</p>
    </div>
  `;
}
async function sendOrderConfirmationEmail(order) {
    const html = generateOrderEmailHtml(order);
    const subject = `${util_1.email_data.subjectPrefix} ${order.id}`;
    const text = `${util_1.email_data.greeting} ${order.name}, ${util_1.email_data.confirmation} ${util_1.email_data.orderNumberLabel} #${order.id}. ${util_1.email_data.totalLabel}${order.cost.toFixed(2)}`;
    const transporter = getTransporter();
    try {
        //   Send to customer
        await transporter.sendMail({
            from: `"${process.env.STORE_NAME}" <${process.env.STORE_EMAIL}>`,
            to: order.email,
            replyTo: process.env.GMAIL_USER, // customer replies to Gmail
            subject,
            text,
            html,
        });
        //  Send to admin (your Gmail)
        await transporter.sendMail({
            from: `"${process.env.STORE_NAME}" <${process.env.STORE_EMAIL}>`,
            to: process.env.GMAIL_USER,
            replyTo: order.email, // so you can reply to the customer
            subject,
            text,
            html,
        });
        console.log("✅ Email sent:");
    }
    catch (err) {
        console.error("❌ Email sending failed:", err);
    }
}
async function sendAdminWhatsApp(id) {
    const text = `📦 התקבלה הזמנה חדשה באתר YAARASTORE!\n\n🔗 לצפייה בהזמנה: ${process.env.FRONT_URL}/admin/order/${id}`;
    const url = `https://api.callmebot.com/whatsapp.php?phone=${process.env.WHATSAPP_NUMBER}&text=${encodeURIComponent(text)}&apikey=${process.env.CALLMEBOT_API_KEY}`;
    try {
        const res = await fetch(url);
        const result = await res.text();
        console.log("✅ WhatsApp sent:", result);
    }
    catch (err) {
        console.error("❌ WhatsApp failed:", err);
    }
}
//# sourceMappingURL=service.js.map