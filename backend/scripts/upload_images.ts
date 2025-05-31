// @ts-nocheck

import dotenv from "dotenv";
dotenv.config();

import fs from "fs";
import path from "path";
import sharp from "sharp";
import { put } from "@vercel/blob";

const imagesFolder = path.join(__dirname, "data/images");

async function upload_images() {
  const files = fs
    .readdirSync(imagesFolder)
    .filter((file) =>
      [".jpg", ".jpeg", ".png", ".webp"].includes(
        path.extname(file).toLowerCase(),
      ),
    );

  const urls: string[] = [];

  for (const file of files) {
    const filePath = path.join(imagesFolder, file);
    const fileBuffer = fs.readFileSync(filePath);

    const baseName = path.parse(file).name;
    const fileName = `${baseName}.jpg`;

    console.log(`⬆️ Uploading ${fileName}...`);

    const resizedBuffer = await sharp(fileBuffer)
      .resize(500, 500, { fit: "cover", position: "top" })
      .jpeg({ quality: 80 })
      .toBuffer();

    const blob = await put(`products/${fileName}`, resizedBuffer, {
      access: "public",
      allowOverwrite: true,
    });

    console.log(`✅ Uploaded: ${blob.url}`);
    urls.push(blob.url);
  }

  console.log("\n📦 Uploaded URLs:");
  console.log(JSON.stringify(urls, null, 2));

  // Optional: save locally
  fs.writeFileSync(
    path.join(__dirname, "data/uploaded_urls.json"),
    JSON.stringify(urls, null, 2),
  );
  console.log("✅ Saved to uploaded_urls.json");
}

upload_images().catch((err) => {
  console.error("❌ Upload failed:", err);
});
