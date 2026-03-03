class LocaleCache {
  private locale: "he" | "en" = "en";
  get(): "he" | "en" {
    // return "he";
    // return "en";

    if (typeof document !== "undefined") {
      const cookie = document.cookie
        .split("; ")
        .find((row) => row.startsWith("NEXT_LOCALE="));
      const value = cookie?.split("=")[1];

      this.locale = value === "he" ? "he" : "en";
      return this.locale;
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
