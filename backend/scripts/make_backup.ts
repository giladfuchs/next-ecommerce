/**
 pnpm tsx scripts/make_backup.ts
 Backup script for your real DB (not for seeding!)
 This will export products, categories, orders, and download all product images.
 Output is saved in /backup and zipped with timestamp.
 */

import "reflect-metadata";
import dotenv from "dotenv";
dotenv.config();

import path from "path";
import fsSync from "fs";
import fs from "fs/promises";
import { mkdir } from "fs/promises";
import { Readable } from "stream";
import { exec } from "child_process";
import { promisify } from "util";

import { DB } from "../src/lib/db";
import { Category, Product, Order, User } from "../src/lib/entities";

const SCRIPT_DIR = __dirname;
const OUTPUT_DIR = path.join(SCRIPT_DIR, "backup/images");
const OUTPUT_MAP = path.join(SCRIPT_DIR, "backup/image-mapping.json");
const DB_DATA_PATH = path.join(SCRIPT_DIR, "backup/db_data.json");
const execAsync = promisify(exec);

async function ensureDir(): Promise<void> {
  await mkdir(OUTPUT_DIR, { recursive: true });
}

function getFileNameFromUrl(url: string): string {
  const pathname = new URL(url).pathname;
  return decodeURIComponent(path.basename(pathname));
}

async function downloadImage(url: string, filename: string): Promise<string> {
  const dest = path.join(OUTPUT_DIR, filename);
  if (fsSync.existsSync(dest)) return dest;

  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to download ${url}`);
  if (!res.body) throw new Error("No response body");

  const fileStream = fsSync.createWriteStream(dest);
  const nodeStream = Readable.fromWeb(res.body as any);

  await new Promise((resolve, reject) => {
    nodeStream.pipe(fileStream).on("error", reject).on("finish", resolve);
  });

  return dest;
}

async function DBToJson(): Promise<void> {
  await DB.initialize();

  const [products, categories, orders, users] = await Promise.all([
    DB.getRepository(Product).find({
      relations: ["images"],
      order: {
        updatedAt: "DESC",
        images: { position: "ASC" },
      },
    }),
    DB.getRepository(Category).find({
      order: { position: "ASC" },
    }),
    DB.getRepository(Order).find({
      relations: ["items"],
    }),
    DB.getRepository(User).find({}),
  ]);

  const data = { products, categories, orders, users };

  await fs.writeFile(DB_DATA_PATH, JSON.stringify(data, null, 2), "utf8");
  console.log(`✅ Exported DB to ${DB_DATA_PATH}`);
}

async function backupImages(): Promise<void> {
  await ensureDir();

  const raw = await fs.readFile(DB_DATA_PATH, "utf8");
  const parsed: {
    products: {
      id: number;
      title: string;
      images: { url: string; id: number }[];
    }[];
  } = JSON.parse(raw);

  const mapping: Record<number, string> = {};

  for (const product of parsed.products) {
    for (const image of product.images) {
      const fileName = getFileNameFromUrl(image.url);
      try {
        await downloadImage(image.url, fileName);
        mapping[image.id] = fileName;
      } catch (e: any) {
        console.error(`✖ ${product.title} → ${image.url}: ${e.message}`);
      }
    }
  }

  await fs.writeFile(OUTPUT_MAP, JSON.stringify(mapping, null, 2), "utf8");
  console.log(`✅ Mapping saved to ${OUTPUT_MAP}`);
}

async function zipBackup(): Promise<void> {
  const now = new Date();
  const dateStr = `${String(now.getDate()).padStart(2, "0")}-${String(now.getMonth() + 1).padStart(2, "0")}-${now.getFullYear()}_${String(now.getHours()).padStart(2, "0")}-${String(now.getMinutes()).padStart(2, "0")}`;
  const zipName = `backup_${dateStr}.zip`;
  const zipPath = path.join(SCRIPT_DIR, zipName);

  try {
    await execAsync(`zip -r "${zipPath}" backup/`, { cwd: SCRIPT_DIR });
    console.log(`✅ Created ${zipName}`);
  } catch (err: any) {
    console.error("❌ Failed to zip backup:", err.message || err);
  }
}

(async () => {
  try {
    await DBToJson();
    await backupImages();
    await zipBackup();
    process.exit(0);
  } catch (err) {
    console.error("❌ Backup script failed:", err);
    process.exit(1);
  }
})();
