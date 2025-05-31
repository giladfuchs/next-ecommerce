"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
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
sendAdminWhatsApp(3).catch((err) => {
    console.error(err);
    process.exit(1);
});
//# sourceMappingURL=whatsapp.js.map