// @ts-nocheck
import { readFile, rm } from "node:fs/promises";
import { basename, join, resolve } from "node:path";

import { getPayload, type Payload } from "payload";

import appConfig from "@/lib/core/config";
import { OrderStatus } from "@/lib/core/types/types";

import type { SeedIds } from "./helpers";

import {
  cartesianProduct,
  makeRichTextDescription,
  randInt,
  getRandomSlice,
  getRandom,
  randFloat,
  shuffle,
} from "./helpers";

// pnpm tsx seed/run.ts

// Product images on disk live flat in seed/data/images, named "<product.image_name>_<n>.webp"
// for n = 1..product.images (see mock-data-*.json). No more per-category folders.
const IMAGE_EXTENSION = ".webp";

export default class SeedService {
  payload!: Payload;
  private availableMedia: Array<{
    id: number;
    alt?: string | null;
    filename?: string | null;
  }> = [];
  private mockData: {
    pages: any[];
    siteSettings: any;
    user: {};
    variants: any[];
    categories: any[];
    products: any[];
    orders: any[];
  } = {
    pages: [],
    user: {},
    siteSettings: {},
    variants: [],
    categories: [],
    products: [],
    orders: [],
  };

  private ids: SeedIds = {
    mediaIds: [],
    categoryIds: [],
    mediaIdsByVendor: {},
    categoryIdsByVendor: {},
    productMediaIds: [],
    variantTypeIds: {},
    variantOptionIds: {},
  };
  constructor(private mode: "seed" | "reset" = "reset") {}

  async init() {
    const { default: config } = await import("../src/payload.config");

    this.payload = await getPayload({ config });
    this.mockData = JSON.parse(
      await readFile(
        join(
          process.cwd(),
          "seed",
          "data",
          `mock-data-${appConfig.LOCAL.lang}.json`,
        ),
        "utf8",
      ),
    );
  }

  async uploadMediaFromDisk(filePath: string, alt = "Product image") {
    const absolutePath = resolve(process.cwd(), "seed", "data", filePath);

    const buf = await readFile(absolutePath);
    const filename = basename(filePath);

    const mimetype = filename.endsWith(".webp")
      ? "image/webp"
      : filename.endsWith(".png")
        ? "image/png"
        : filename.endsWith(".gif")
          ? "image/gif"
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

    this.availableMedia.push({
      id: created.id,
      alt: created.alt ?? alt,
      filename: created.filename ?? filename,
    });

    return created.id;
  }

  normalizeMediaLookupValue(value: unknown) {
    if (typeof value !== "string") return "";

    let normalized = value;
    try {
      normalized = decodeURIComponent(value);
    } catch {}

    return normalized.normalize("NFKC").trim().toLocaleLowerCase();
  }

  findAvailableMedia(filePath: string, alt: string) {
    const filename = this.normalizeMediaLookupValue(basename(filePath));
    const normalizedAlt = this.normalizeMediaLookupValue(alt);

    const filenameMatch = this.availableMedia.find(
      (media) => this.normalizeMediaLookupValue(media.filename) === filename,
    );
    if (filenameMatch) {
      return { media: filenameMatch, matchedBy: "filename" as const };
    }

    const altMatch = this.availableMedia.find(
      (media) => this.normalizeMediaLookupValue(media.alt) === normalizedAlt,
    );
    if (altMatch) return { media: altMatch, matchedBy: "alt" as const };

    return null;
  }

  async resolveMediaFromDisk(filePath: string, alt?: string) {
    const resolvedAlt = alt?.trim() || basename(filePath);
    if (this.mode !== "seed") {
      const existing = this.findAvailableMedia(filePath, resolvedAlt);
      if (existing) {
        this.payload.logger.info(
          `media:reuse ${basename(filePath)} matchedBy=${existing.matchedBy}`,
        );
        return existing.media.id;
      }
    }
    this.payload.logger.info(`media:upload ${basename(filePath)}`);
    return this.uploadMediaFromDisk(filePath, resolvedAlt);
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
    if (!appConfig.STORAGE_URL) {
      this.payload.logger.info("seedMedia:remove-local-media-dir");
      await rm(resolve(process.cwd(), "public", "media"), {
        recursive: true,
        force: true,
      });
    }

    this.ids.mediaIdsByVendor = {};
    this.ids.productMediaIds = [];

    for (const product of this.mockData.products) {
      const imageCount = Number(product.images) || 0;
      const productMediaIds: number[] = [];

      for (let i = 1; i <= imageCount; i++) {
        const filename = `${product.image_name}_${i}${IMAGE_EXTENSION}`;
        const id = await this.uploadMediaFromDisk(
          join("images", filename),
          product.image_name,
        );
        this.ids.mediaIds.push(id);
        productMediaIds.push(id);
      }

      this.ids.productMediaIds.push(productMediaIds);
      (this.ids.mediaIdsByVendor[product.vendor] ??= []).push(
        ...productMediaIds,
      );
    }

    this.payload.logger.info(
      `seedMedia:done total=${this.ids.mediaIds.length}`,
    );
  }

  async seedSiteSettings() {
    this.payload.logger.info("seedSiteSettings:start");

    const { general, ...siteSettings } = this.mockData.siteSettings;
    const { logo: logoFile, ...generalSettings } = general;
    const logo = await this.resolveMediaFromDisk(logoFile, "Store logo");

    await this.payload.updateGlobal({
      slug: "site-settings",
      data: {
        ...siteSettings,
        general: {
          ...generalSettings,
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
        data: {
          label: def.label,
          name: def.name,
          selectorStyle: def.selectorStyle,
        },
      });

      this.ids.variantTypeIds[def.name] = type.id;
      this.ids.variantOptionIds[def.name] = [];

      for (const opt of def.options) {
        const option =
          typeof opt === "string"
            ? { label: opt, value: opt.toLowerCase() }
            : opt;
        const created = await this.payload.create({
          collection: "variantOptions",
          data: {
            variantType: type.id,
            label: option.label,
            value: option.value ?? String(option.label).toLowerCase(),
            swatch: option.swatch ?? null,
          },
        });

        this.ids.variantOptionIds[def.name].push(created.id);
      }
    }

    this.payload.logger.info("createVariantSetup:done");
  }

  async seedCategories() {
    this.payload.logger.info("seedCategories:start");
    this.ids.categoryIdsByVendor = {};

    for (let i = 0; i < this.mockData.categories.length; i++) {
      const c = this.mockData.categories[i];
      const vendorMediaIds = this.ids.mediaIdsByVendor[c.vendor];

      if (!vendorMediaIds?.length) {
        throw new Error(`No media found for vendor ${c.vendor}`);
      }

      const created = await this.payload.create({
        collection: "category",
        data: {
          _status: "published",
          title: c.title,
          faqs: c.faqs,
          position: i,
          generateSlug: true,
          description: makeRichTextDescription(c.description),
          image: getRandom(vendorMediaIds),
        },
      });

      this.ids.categoryIds.push(created.id);
      this.ids.categoryIdsByVendor[c.vendor] = created.id;
    }

    this.payload.logger.info(
      `seedCategories:done total=${this.ids.categoryIds.length}`,
    );
  }

  async seedProducts() {
    this.payload.logger.info("seedProducts:start");

    const typeKeys = this.mockData.variants
      .map((definition) => definition.name)
      .filter((name) => this.ids.variantTypeIds[name]);
    const variantTypeIds = typeKeys.map(
      (name) => this.ids.variantTypeIds[name],
    );
    const optionGroups = typeKeys.map(
      (name) => this.ids.variantOptionIds[name] ?? [],
    );
    const reviewDateRangeEnd = Date.now();
    const reviewDateRangeStart = new Date(reviewDateRangeEnd);
    reviewDateRangeStart.setMonth(reviewDateRangeStart.getMonth() - 3);

    for (const [productIndex, p] of this.mockData.products.entries()) {
      try {
        const categoryId = this.ids.categoryIdsByVendor[p.vendor];
        const productMediaIds = this.ids.productMediaIds[productIndex];

        if (!categoryId) {
          throw new Error(`No category found for vendor ${p.vendor}`);
        }

        if (!productMediaIds?.length) {
          throw new Error(`No media found for product ${p.title}`);
        }

        const enableVariants =
          Math.random() > 0.3 &&
          variantTypeIds.length > 0 &&
          optionGroups.every((options) => options.length > 0);

        const priceInUSD = randFloat(5, 40);
        const originalPriceInUSD =
          Math.random() > 0.5 ? priceInUSD + randFloat(5, 20) : null;

        const createdProduct = await this.payload.create({
          collection: "products",
          data: {
            title: p.title,
            faqs: p.faqs,
            generateSlug: true,
            _status: "published",
            categories: [categoryId],
            inventory: randInt(11, 62),
            priceInUSD,
            originalPriceInUSD,
            priceInUSDEnabled: true,
            enableVariants,
            variantTypes: enableVariants ? variantTypeIds : [],
            description: makeRichTextDescription(p.description),
            gallery: productMediaIds.map((id) => ({
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
              createdAt: new Date(
                randInt(reviewDateRangeStart.getTime(), reviewDateRangeEnd),
              ).toISOString(),
            },
          });
        }

        if (!enableVariants) continue;
        const optionGroupsSlice = optionGroups.map((group, index) =>
          getRandomSlice(group, index === 0 ? 2 : 4, index === 0 ? 4 : 7).sort(
            (a, b) => a - b,
          ),
        );
        const differentPriceVariants = Math.random() > 0.1;
        const optionCombinations = cartesianProduct(optionGroupsSlice);
        for (const [
          combinationIndex,
          options,
        ] of optionCombinations.entries()) {
          const shouldSkip = Math.random() > 0.8;
          if (shouldSkip) continue;
          const useCustomPrice =
            differentPriceVariants &&
            combinationIndex > 0 &&
            Math.random() > 0.75;
          const variantPrice = useCustomPrice
            ? randFloat(priceInUSD, priceInUSD + 25)
            : null;
          const variantOriginalPrice =
            useCustomPrice && Math.random() > 0.5
              ? variantPrice + randFloat(5, 20)
              : null;

          await this.payload.create({
            collection: "variants",
            data: {
              title: `${p.title} — ${combinationIndex + 1}`,
              product: createdProduct.id,
              options,
              inventory: Math.random() > 0.15 ? randInt(1, 10) : 0,
              priceInUSDEnabled: useCustomPrice,
              priceInUSD: variantPrice,
              originalPriceInUSD: variantOriginalPrice,
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

    const ids = shuffle(products.docs.map((p) => p.id));

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

  async seedOrders() {
    this.payload.logger.info("seedOrders:start");

    const orderCustomers = Array.isArray(this.mockData.orders)
      ? this.mockData.orders
      : [];
    if (!orderCustomers.length) {
      this.payload.logger.info("seedOrders:skip no mock orders");
      return;
    }

    const { docs: products } = await this.payload.find({
      collection: "products",
      depth: 0,
      pagination: false,
      select: {
        title: true,
        priceInUSD: true,
      },
    });

    if (!products.length) {
      throw new Error("Products are required before seeding orders");
    }

    const rangeEnd = Date.now();
    const rangeStart = new Date(rangeEnd);
    rangeStart.setDate(rangeStart.getDate() - (Math.random() > 0.3 ? 90 : 15));
    const statuses = [
      OrderStatus.NEW,
      OrderStatus.NEW,
      OrderStatus.READY,
      OrderStatus.DONE,
      OrderStatus.DONE,
      OrderStatus.CANCELED,
      OrderStatus.REFUNDED,
    ];

    for (const customer of orderCustomers) {
      const items = getRandomSlice(products, 1, 3).map((product) => {
        const quantity = randInt(1, 3);
        const unitPrice = Number(product.priceInUSD ?? randFloat(10, 40));

        return {
          product: product.id,
          title: product.title,
          quantity,
          unitPrice,
          lineTotal: Number((unitPrice * quantity).toFixed(2)),
        };
      });
      const amount = Number(
        items.reduce((total, item) => total + item.lineTotal, 0).toFixed(2),
      );
      const status = getRandom(statuses);

      const createdOrder = await this.payload.create({
        collection: "orders",
        context: { skipOrderNotification: true },
        data: {
          ...customer,
          items,
          amount,
          createdAt: new Date(
            randInt(rangeStart.getTime(), rangeEnd),
          ).toISOString(),
        },
      });

      if (status !== OrderStatus.NEW) {
        await this.payload.update({
          collection: "orders",
          id: createdOrder.id,
          context: { skipOrderNotification: true },
          data: { status },
        });
      }
    }

    this.payload.logger.info(`seedOrders:done total=${orderCustomers.length}`);
  }

  async seedPages() {
    this.payload.logger.info("seedPages:start");

    if (!this.mockData.pages.length) {
      throw new Error("Pages are missing from mock data");
    }

    for (const pageData of this.mockData.pages) {
      const page = structuredClone(pageData);

      if (typeof page.hero?.media === "string") {
        page.hero.media = await this.resolveMediaFromDisk(
          page.hero.media,
          page.title,
        );
      }
      if (typeof page.meta?.image === "string") {
        page.meta.image = await this.resolveMediaFromDisk(
          page.meta.image,
          page.meta.title,
        );
      }

      await this.payload.create({
        collection: "pages",
        depth: 0,
        data: page,
      });
    }

    this.payload.logger.info(
      `seedPages:done total=${this.mockData.pages.length}`,
    );
  }

  async cleanAllExceptMedia() {
    this.payload.logger.info("cleanAllExceptMedia:start");

    const collections = [
      "transactions",
      "orders",
      "carts",
      "reviews",
      "variants",
      "products",
      "pages",
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
      select: { id: true, alt: true, filename: true },
    });

    this.availableMedia = res.docs.map((doc: any) => ({
      id: doc.id,
      alt: doc.alt,
      filename: doc.filename,
    }));
    this.ids.mediaIds = res.docs.map((doc: any) => doc.id);
    this.ids.mediaIdsByVendor = {};
    this.ids.productMediaIds = [];

    for (const product of this.mockData.products) {
      const prefix = `${product.image_name}_`;
      const productMediaIds = res.docs
        .filter(
          (doc: any) =>
            typeof doc.filename === "string" && doc.filename.startsWith(prefix),
        )
        .sort((a: any, b: any) =>
          a.filename.localeCompare(b.filename, undefined, { numeric: true }),
        )
        .map((doc: any) => doc.id);

      this.ids.productMediaIds.push(productMediaIds);
      if (productMediaIds.length) {
        (this.ids.mediaIdsByVendor[product.vendor] ??= []).push(
          ...productMediaIds,
        );
      }
    }

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
    await this.seedPages();
    await this.seedCategories();
    await this.createVariantSetup();
    await this.seedProducts();
    await this.addRelatedProducts();
    for (let i = 0; i < 6; i++) {
      await this.seedOrders();
    }

    this.payload.logger.info("run:done");
  }
}
