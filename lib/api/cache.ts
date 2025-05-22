import {
  AGTableModelType,
  Category,
  ModelType,
  Order,
  Product,
} from "../types";

type CacheData = {
  products: Product[];
  categories: Category[];
  order: Order[];
};

class MemoryCache {
  private data: CacheData = { products: [], categories: [], order: [] };
  private lastFetched = 0;
  private inFlight: Promise<CacheData> | null = null;

  readonly CACHE_DURATION = 10 * 60 * 1000;

  get(): CacheData {
    return this.data;
  }

  set(data: CacheData) {
    this.data = { ...this.data, ...data };
    this.lastFetched = Date.now();
  }

  isFresh(): boolean {
    return Date.now() - this.lastFetched < this.CACHE_DURATION;
  }

  getInFlight(): Promise<CacheData> | null {
    return this.inFlight;
  }

  setInFlight(promise: Promise<CacheData> | null) {
    this.inFlight = promise;
  }

  getByModel(model: ModelType): AGTableModelType[] {
    switch (model) {
      case ModelType.product:
        return this.data.products;
      case ModelType.category:
        return this.data.categories;
      case ModelType.order:
        return this.data.order;
    }
  }

  setByModel(model: ModelType, rows: AGTableModelType[]): void {
    switch (model) {
      case ModelType.product:
        this.data.products = rows as Product[];
        break;
      case ModelType.category:
        this.data.categories = rows as Category[];
        break;
      case ModelType.order:
        this.data.order = rows as Order[];
        break;
    }
  }
}

export const cache = new MemoryCache();

class LocaleCache {
  private locale: "he" | "en" = "en";

  get(): "he" | "en" {
    if (typeof document !== "undefined") {
      const cookie = document.cookie
        .split("; ")
        .find((row) => row.startsWith("NEXT_LOCALE="));
      const value = cookie?.split("=")[1];
      this.locale = value === "en" ? "en" : "he";
      return this.locale;
    }

    try {
      const { headers } = require("next/headers");
      const cookie = headers().get("cookie") || "";
      const match = cookie.match(/NEXT_LOCALE=(en|he)/);
      this.locale = match?.[1] === "en" ? "en" : "he";
    } catch {
      this.locale = "en";
    }

    return this.locale;
  }

  set(locale: "he" | "en") {
    this.locale = locale;
  }

  isRtl(): boolean {
    return this.get() === "he";
  }

  dir(): "rtl" | "ltr" {
    return this.isRtl() ? "rtl" : "ltr";
  }
}

export const localeCache = new LocaleCache();
