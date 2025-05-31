"use strict";
// @ts-nocheck
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const sharp_1 = __importDefault(require("sharp"));
const blob_1 = require("@vercel/blob");
const imagesFolder = path_1.default.join(__dirname, "data/images");
async function upload_images() {
    const files = fs_1.default
        .readdirSync(imagesFolder)
        .filter((file) => [".jpg", ".jpeg", ".png", ".webp"].includes(path_1.default.extname(file).toLowerCase()));
    const urls = [];
    for (const file of files) {
        const filePath = path_1.default.join(imagesFolder, file);
        const fileBuffer = fs_1.default.readFileSync(filePath);
        const baseName = path_1.default.parse(file).name;
        const fileName = `${baseName}.jpg`;
        console.log(`⬆️ Uploading ${fileName}...`);
        const resizedBuffer = await (0, sharp_1.default)(fileBuffer)
            .resize(500, 500, { fit: "cover", position: "top" })
            .jpeg({ quality: 80 })
            .toBuffer();
        const blob = await (0, blob_1.put)(`products/${fileName}`, resizedBuffer, {
            access: "public",
            allowOverwrite: true,
        });
        console.log(`✅ Uploaded: ${blob.url}`);
        urls.push(blob.url);
    }
    console.log("\n📦 Uploaded URLs:");
    console.log(JSON.stringify(urls, null, 2));
    // Optional: save locally
    fs_1.default.writeFileSync(path_1.default.join(__dirname, "data/uploaded_urls.json"), JSON.stringify(urls, null, 2));
    console.log("✅ Saved to uploaded_urls.json");
}
upload_images().catch((err) => {
    console.error("❌ Upload failed:", err);
});
//# sourceMappingURL=upload_images.js.map