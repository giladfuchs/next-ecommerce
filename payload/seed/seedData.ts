// @ts-nocheck
import { resolve, basename, join } from "node:path";
import { readFile } from "node:fs/promises";
import { getPayload, type Payload } from "payload";

import {
  makeRichTextDescription,
  randInt,
  SeedIds,
  getRandomSlice,
  getRandom,
  randFloat,
} from "./helpers";

// pnpm tsx seed/run.ts



const loadMockData = async () => {
  const dbDataPath = join(process.cwd(), "seed", "data", "mock-data.json");
  return JSON.parse(await readFile(dbDataPath, "utf8"));
};
export const resetDb = async () => {
  const { execSync } = await import("node:child_process");

  execSync("yes | payload migrate:fresh", {
    stdio: "inherit",
    env: process.env,
    shell: true,
  });
};
const IMAGE_LIMIT = false;

export class SeedService {
  private payload!: Payload;
  private mockData: any;

  private ids: SeedIds = {
    mediaIds: [],
    categoryIds: [],
    variantTypeIds: {},
    variantOptionIds: {},
  };

  async init() {
    const { default: config } = await import("../src/payload.config");

    this.payload = await getPayload({ config });
    this.mockData = await loadMockData();
  }



async uploadMediaFromDisk(filePath: string, alt = "Product image") {
  const absolutePath = resolve(process.cwd(), filePath);
  const buf = await readFile(absolutePath);
  const filename = basename(filePath);

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
      data: this.mockData.user,
    });
  }

  async seedMedia() {
    const imagesToUse =
      IMAGE_LIMIT && IMAGE_LIMIT < this.mockData.images.length
        ? this.mockData.images.slice(0, IMAGE_LIMIT)
        : this.mockData.images;

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
        ...this.mockData.siteSettings,
        home: {
          ...this.mockData.siteSettings.home,
          description: makeRichTextDescription(
            this.mockData.siteSettings.home.description,
          ),
          image_meta,
          logo,
        },
      },
    });
  }
  async createVariantSetup() {
    this.ids.variantTypeIds = {};
    this.ids.variantOptionIds = {};

    for (const def of this.mockData.variants) {
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
    for (let i = 0; i < this.mockData.categories.length; i++) {
      const c = this.mockData.categories[i];

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

    for (const p of this.mockData.products) {
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

  async cleanAllExceptMedia() {
    const collections = [
      "reviews",
      "variants",
      "products",
      "category",
      "variantOptions",
      "variantTypes",
      "users",
    ];

    for (const collection of collections) {
      await this.payload.delete({
        collection,
        where: {
          id: {
            exists: true,
          },
        },
      });
    }
  }
  async loadExistingMediaIds() {
    const res = await this.payload.find({
      collection: "media",
      depth: 0,
      limit: 1000,
      pagination: false,
      select: { id: true },
    });

    this.ids.mediaIds = res.docs.map((doc: any) => doc.id);
  }
  async run(mode: "seed" | "reset" = "seed") {
    if (mode === "seed") {
      resetDb();
      await this.init();
      await this.seedMedia();
    } else {
      await this.init();
      await this.loadExistingMediaIds();
      await this.cleanAllExceptMedia();
    }

    await this.createUser();
    await this.seedSiteSettings();
    await this.seedCategories();
    await this.createVariantSetup();
    await this.seedProducts();
    await this.addRelatedProducts();
  }
}
export const run_seed_reset = async (mode: "seed" | "reset" = "seed") => {
  const seed = new SeedService();
  await seed.run(mode);
};
