const isDev = process.env.NODE_ENV === "development";
const isTest = process.env.NODE_ENV === "test";
const port = process.env.NEXT_PUBLIC_PORT || "4000";

export const API_URL: string =
    isDev || isTest
        ? `http://localhost:${port}`
        : process.env.NEXT_PUBLIC_API_URL && process.env.NEXT_PUBLIC_API_URL.trim() !== ""
            ? process.env.NEXT_PUBLIC_API_URL
            : "https://your-api.vercel.app";

export const baseUrl: string =
    process.env.NEXT_PUBLIC_BASE_URL && process.env.NEXT_PUBLIC_BASE_URL.trim() !== ""
        ? process.env.NEXT_PUBLIC_BASE_URL
        : "https://your-store.vercel.app";
export const SITE_NAME = process.env.NEXT_PUBLIC_SITE_NAME;
export const GOOGLE_ANALYTICS = process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS;
export const GOOGLE_SITE_VERIFICATION =
  process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION;

export const FOOTER_DATA = process.env.NEXT_PUBLIC_FOOTER_DATA || "";
export const WHATSAPP_MESSAGE = process.env.NEXT_PUBLIC_WHATSAPP_MESSAGE;
export const ICON_IMAGE_URL = process.env.NEXT_PUBLIC_ICON_IMAGE_URL ?? "";

export const MAX_FILE_SIZE_MB = 1;

export const SEVEN_DAYS = 7 * 24 * 60 * 60 * 1000;
