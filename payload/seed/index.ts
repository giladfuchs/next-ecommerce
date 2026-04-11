// @ts-nocheck
import { resolve, basename, join } from "node:path";
import { readFile, rm } from "node:fs/promises";
import { getPayload, type Payload } from "payload";

import {
  makeRichTextDescription,
  randInt,
  SeedIds,
  getRandomSlice,
  getRandom,
  randFloat,
} from "./helpers";
import appConfig from "@/lib/core/config";

// pnpm tsx seed/run.ts

const IMAGE_LIMIT = 11;

export default class SeedService {
  private payload!: Payload;
  private mockData: {
    siteSettings: any;
    user: {};
    variants: any[];
    categories: any[];
    products: any[];
    images: any[];
  } = {
    user: {},
    siteSettings: {},
    variants: [],
    categories: [],
    products: [],
    images: [],
  };

  private ids: SeedIds = {
    mediaIds: [],
    categoryIds: [],
    variantTypeIds: {},
    variantOptionIds: {},
  };
  constructor(private mode: "seed" | "reset" = "reset") {}

  async init() {
    const { default: config } = await import("../src/payload.config");

    this.payload = await getPayload({ config });
    this.mockData = JSON.parse(
      await readFile(
        join(process.cwd(), "seed", "data", "mock-data.json"),
        "utf8",
      ),
    );
  }

  async uploadMediaFromDisk(filePath: string, alt = "Product image") {
    const absolutePath = resolve(
      process.cwd(),
      "seed",
      "data",
      basename(filePath),
    );

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
    this.payload.logger.info("createUser:start");

    await this.payload.create({
      collection: "users",
      data: this.mockData.user,
    });
    this.payload.logger.info("createUser:done");
  }

  async seedMedia() {
    if (!appConfig.BLOB_URL) {
      this.payload.logger.info("seedMedia:remove-local-media-dir");
      await rm(resolve(process.cwd(), "public", "media"), {
        recursive: true,
        force: true,
      });
    }

    const imagesToUse =
      IMAGE_LIMIT && IMAGE_LIMIT < this.mockData.images.length
        ? this.mockData.images.slice(0, IMAGE_LIMIT)
        : this.mockData.images;

    this.payload.logger.info(
      `seedMedia:uploading ${imagesToUse.length} images`,
    );

    for (const url of imagesToUse) {
      const id = await this.uploadMediaFromUrl(url);
      this.ids.mediaIds.push(id);
    }

    this.payload.logger.info(
      `seedMedia:done total=${this.ids.mediaIds.length}`,
    );
  }

  async seedSiteSettings() {
    this.payload.logger.info("seedSiteSettings:start");

    const image_meta = await this.uploadMediaFromDisk("image_meta.webp");

    const logo = await this.uploadMediaFromDisk("logo.webp");

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

    this.payload.logger.info("seedSiteSettings:done");
  }

  async createVariantSetup() {
    this.payload.logger.info("createVariantSetup:start");

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

    this.payload.logger.info("createVariantSetup:done");
  }

  async seedCategories() {
    this.payload.logger.info("seedCategories:start");

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

    this.payload.logger.info(
      `seedCategories:done total=${this.ids.categoryIds.length}`,
    );
  }

  async seedProducts() {
    this.payload.logger.info("seedProducts:start");

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
        this.payload.logger.error({
          msg: `seedProducts:failed ${p.title}`,
          err,
        });
      }
    }

    this.payload.logger.info("seedProducts:done");
  }
  async addRelatedProducts() {
    this.payload.logger.info("addRelatedProducts:start");

    const products = await this.payload.find({
      collection: "products",
      depth: 0,
      limit: 1000,
      pagination: false,
      select: { id: true },
    });

    const ids = products.docs.map((p) => p.id);

    this.payload.logger.info(`addRelatedProducts:found ${ids.length} products`);

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

    this.payload.logger.info("addRelatedProducts:done");
  }

  async cleanAllExceptMedia() {
    this.payload.logger.info("cleanAllExceptMedia:start");

    const collections = [
      "reviews",
      "variants",
      "products",
      "category",
      "variantOptions",
      "variantTypes",
      "users",
    ] as const;

    for (const collection of collections) {
      await this.payload.db.deleteMany({
        collection,
        where: {},
      });
    }

    for (const collection of collections) {
      if (!this.payload.collections[collection].config.versions) continue;

      await this.payload.db.deleteVersions({
        collection,
        where: {},
      });
    }

    this.payload.logger.info("cleanAllExceptMedia:done");
  }

  async loadExistingMediaIds() {
    this.payload.logger.info("loadExistingMediaIds:start");

    const res = await this.payload.find({
      collection: "media",
      depth: 0,
      limit: 1000,
      pagination: false,
      select: { id: true },
    });

    this.ids.mediaIds = res.docs.map((doc: any) => doc.id);

    this.payload.logger.info(
      `loadExistingMediaIds:done total=${this.ids.mediaIds.length}`,
    );
  }

  async run() {
    await this.init();
    this.payload.logger.info(`run:start mode=${this.mode}`);

    if (this.mode === "seed") {
      await this.seedMedia();
    } else {
      await this.loadExistingMediaIds();
      await this.cleanAllExceptMedia();
    }

    await this.createUser();

    await this.seedSiteSettings();
    await this.seedCategories();
    await this.createVariantSetup();
    await this.seedProducts();
    await this.addRelatedProducts();

    this.payload.logger.info("run:done");
  }
}
