import "dotenv/config";
import dotenv from "dotenv";
import { getPayload } from "payload";
import config from "../src/payload.config.js";
import fs from "fs/promises";
import path from "path";
import type { Payload } from "payload";

import { execSync } from "node:child_process";
import {
  makeRichTextDescription,
  randInt,
  SeedIds,
  getRandomSlice,
  getRandom,
  randFloat,
} from "./helpers";
dotenv.config();

// pnpm tsx  seed/seedData.ts

const DB_DATA_PATH = "seed/data/mock-data.json";

export const resetDb = () => {
  execSync("yes | payload migrate:fresh", {
    stdio: "inherit",
    env: process.env,
    shell: true,
  });
};
const IMAGE_LIMIT = false;
const mockData = JSON.parse(await fs.readFile(DB_DATA_PATH, "utf8"));

class SeedService {
  private payload!: Payload;
  private ids: SeedIds = {
    mediaIds: [],
    categoryIds: [],
    variantTypeIds: {},
    variantOptionIds: {},
  };

  async init() {
    this.payload = await getPayload({ config });
  }

  async uploadMediaFromDisk(filePath: string, alt = "Product image") {
    const absolutePath = path.resolve(process.cwd(), filePath);
    const buf = await fs.readFile(absolutePath);
    const filename = path.basename(filePath);

    const mimetype = filename.endsWith(".webp")
      ? "image/webp"
      : filename.endsWith(".png")
        ? "image/png"
        : "image/jpeg";

    const created = await this.payload.create({
      collection: "media",
      data: { alt },
      file: {
        data: buf,
        mimetype,
        name: filename,
        size: buf.length,
      },
    });

    return created.id;
  }

  async uploadMediaFromUrl(url: string, alt = "Product image") {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`media fetch failed: ${res.status}`);

    const buf = Buffer.from(await res.arrayBuffer());
    const filename = new URL(url).pathname.split("/").pop() || "image.jpg";
    const mimetype = res.headers.get("content-type") || "image/jpeg";

    const created = await this.payload.create({
      collection: "media",
      data: { alt },
      file: {
        data: buf,
        mimetype,
        name: filename,
        size: buf.length,
      },
    });

    return created.id;
  }

  async createUser() {
    await this.payload.create({
      collection: "users",
      data: mockData.user,
    });
  }

  async seedMedia() {
    const imagesToUse =
      IMAGE_LIMIT && IMAGE_LIMIT < mockData.images.length
        ? mockData.images.slice(0, IMAGE_LIMIT)
        : mockData.images;

    for (const url of imagesToUse) {
      const id = await this.uploadMediaFromUrl(url);
      this.ids.mediaIds.push(id);
    }
  }

  async seedSiteSettings() {
    const image_meta = await this.uploadMediaFromDisk(
      "seed/data/image_meta.webp",
    );
    const logo = await this.uploadMediaFromDisk("seed/data/logo.webp");

    await this.payload.updateGlobal({
      slug: "site-settings",
      data: {
        ...mockData.siteSettings,
        home: {
          ...mockData.siteSettings.home,
          description: makeRichTextDescription(
            mockData.siteSettings.home.description,
          ),
          image_meta,
          logo,
        },
      },
    });
  }
  async createVariantSetup() {
    const defs = [
      { label: "Choose Size", name: "size", options: ["S", "M", "L"] },
      {
        label: "Choose Color",
        name: "color",
        options: ["Red", "Green", "Blue"],
      },
    ];

    this.ids.variantTypeIds = {};
    this.ids.variantOptionIds = {};

    for (const def of defs) {
      const type = await this.payload.create({
        collection: "variantTypes",
        data: { label: def.label, name: def.name },
      });

      this.ids.variantTypeIds[def.name] = type.id;
      this.ids.variantOptionIds[def.name] = [];

      for (const opt of def.options) {
        const created = await this.payload.create({
          collection: "variantOptions",
          data: {
            variantType: type.id,
            label: opt,
            value: String(opt).toLowerCase(),
          },
        });

        this.ids.variantOptionIds[def.name].push(created.id);
      }
    }
  }
  async seedCategories() {
    for (let i = 0; i < mockData.categories.length; i++) {
      const c = mockData.categories[i];

      const created = await this.payload.create({
        collection: "category",
        data: {
          _status: "published",
          title: c.title,
          faqs: c.faqs,
          position: i,
          generateSlug: true,
          description: makeRichTextDescription(c.description),
          image: getRandom(this.ids.mediaIds),
        },
      });

      this.ids.categoryIds.push(created.id);
    }
  }
  async seedProducts() {
    const typeKeys = Object.keys(this.ids.variantTypeIds);

    for (const p of mockData.products) {
      try {
        const enableVariants = Math.random() > 0.3 && typeKeys.length > 0;

        let chosenTypeKey: string | null = null;
        let chosenTypeId: number | null = null;
        let chosenOptions: number[] = [];

        if (enableVariants) {
          chosenTypeKey = typeKeys[Math.floor(Math.random() * typeKeys.length)];
          chosenTypeId = this.ids.variantTypeIds[chosenTypeKey] ?? null;
          chosenOptions = this.ids.variantOptionIds[chosenTypeKey] ?? [];
        }
        let priceInUSD = randFloat(5, 40);
        const createdProduct = await this.payload.create({
          collection: "products",
          data: {
            title: p.title,
            faqs: p.faqs,
            generateSlug: true,
            _status: "published",
            categories: [getRandom(this.ids.categoryIds)],
            inventory: randInt(11, 62),
            priceInUSD,
            priceInUSDEnabled: true,
            enableVariants,
            variantTypes: enableVariants && chosenTypeId ? [chosenTypeId] : [],
            description: makeRichTextDescription(p.description),
            gallery: getRandomSlice(this.ids.mediaIds).map((id) => ({
              image: id,
              variantOption: null,
            })),
          },
        });

        const reviewsToCreate = Array.isArray(p.reviews) ? p.reviews : [];

        for (const r of reviewsToCreate) {
          await this.payload.create({
            collection: "reviews",
            data: {
              product: createdProduct.id,
              ...r,
            },
          });
        }

        if (!enableVariants || chosenOptions.length === 0) continue;

        const optionsToUse = chosenOptions.filter(() => Math.random() < 0.7);

        if (optionsToUse.length === 0) {
          optionsToUse.push(
            chosenOptions[Math.floor(Math.random() * chosenOptions.length)],
          );
        }
        let first = true;
        for (const option of optionsToUse) {
          if (first) first = false;
          else priceInUSD = randFloat(priceInUSD, 120);
          await this.payload.create({
            collection: "variants",
            data: {
              title: `${p.title} — Variant`,
              product: createdProduct.id,
              options: [option],
              inventory: randInt(1, 10),
              priceInUSDEnabled: true,
              priceInUSD,
              _status: "published",
            },
          });
        }
      } catch (err) {
        console.error("❌ Failed to create product:", p.title);
        console.error(err);
      }
    }
  }
  async addRelatedProducts() {
    const products = await this.payload.find({
      collection: "products",
      depth: 0,
      limit: 1000,
      pagination: false,
      select: { id: true },
    });

    const ids = products.docs.map((p) => p.id);

    for (const id of ids) {
      const relatedProducts = getRandomSlice(
        ids.filter((x) => x !== id),
        3,
        9,
      );

      await this.payload.update({
        collection: "products",
        id,
        data: { relatedProducts },
      });
    }
  }

  async run() {
    resetDb();
    await this.init();
    await this.createUser();
    await this.seedSiteSettings();
    await this.seedMedia();
    await this.seedCategories();
    await this.createVariantSetup();
    await this.seedProducts();
    await this.addRelatedProducts();
  }
}
async function main() {
  const seed = new SeedService();
  await seed.run();
}

main()
  .then(() => {
    console.log("✅ Seed finished");
    process.exit(0);
  })
  .catch((err) => {
    console.error("❌ Seed failed", err);
    process.exit(1);
  });
