"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const nodemailer_1 = __importDefault(require("nodemailer"));
const dotenv_1 = __importDefault(require("dotenv"));
const service_1 = require("../src/lib/service");
const util_1 = require("../src/lib/util");
dotenv_1.default.config();
const transporter = nodemailer_1.default.createTransport({
    host: "smtp.mailersend.net",
    port: 587,
    secure: false,
    auth: {
        user: process.env.MAILERSEND_SMTP_USER,
        pass: process.env.MAILERSEND_SMTP_PASS,
    },
});
async function sendOrderConfirmationEmail(order) {
    const html = (0, service_1.generateOrderEmailHtml)(order);
    const subject = `${util_1.email_data.subjectPrefix} ${order.id}`;
    const text = `${util_1.email_data.greeting} ${order.name}, ${util_1.email_data.confirmation} ${util_1.email_data.orderNumberLabel} #${order.id}. ${util_1.email_data.totalLabel}${order.cost.toFixed(2)}`;
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
console.log("Script started ✅");
// Example call (test)
sendOrderConfirmationEmail({
    name: "lorem",
    email: "igilfu@gmail.com",
    phone: "0345324322",
    totalQuantity: 2,
    cost: 112.33,
    items: [
        {
            title: "שרך בוסטון",
            quantity: 1,
            unitAmount: "11",
            totalAmount: 11,
            imageUrl: "...",
            imageAlt: "...",
            id: 1,
            productId: 123,
            handle: "srach-boston",
            order: undefined, // or skip if optional
        },
        {
            title: "קיסוס",
            quantity: 1,
            unitAmount: "101.33",
            totalAmount: 101.33,
            imageUrl: "...",
            imageAlt: "...",
            id: 2,
            productId: 124,
            handle: "kisos",
            order: undefined,
        },
    ],
    id: 12,
    status: "new",
    createdAt: new Date().toISOString(),
}); // 👈 bypass type mismatch
//# sourceMappingURL=email.js.map