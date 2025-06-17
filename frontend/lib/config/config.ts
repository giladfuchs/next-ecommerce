const isDev = process.env.NODE_ENV === "development";
const isTest = process.env.NODE_ENV === "test";
const port = process.env.NEXT_PUBLIC_PORT || "4000";

export const baseUrl: string =
  process.env.NEXT_PUBLIC_BASE_URL?.trim() || "https://your-store.vercel.app";

export const API_URL: string =
  isDev || isTest
    ? `http://localhost:${port}`
    : process.env.NEXT_PUBLIC_API_URL?.trim() || `${baseUrl}/api`;

// export const API_URL: string = process.env.NEXT_PUBLIC_API_URL

export const SITE_NAME = process.env.NEXT_PUBLIC_SITE_NAME || "ECOMMERCE";
export const USE_MOCK_DATA = process.env.NEXT_PUBLIC_USE_MOCK_DATA === "true";
export const GOOGLE_ANALYTICS = process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS;
export const GOOGLE_SITE_VERIFICATION =
  process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION;

export const FOOTER_DATA =
  process.env.NEXT_PUBLIC_FOOTER_DATA ||
  "ecommerce@gmail.com,Tel-Aviv,0521234567,ecommerce,ecommerce,https://www.example.com";
export const WHATSAPP_MESSAGE = process.env.NEXT_PUBLIC_WHATSAPP_MESSAGE;
export const ICON_IMAGE_URL =
  process.env.NEXT_PUBLIC_ICON_IMAGE_URL ??
  "https://racit0uja2cckwpw.public.blob.vercel-storage.com/logo-social.png";

// Max upload size: 1 MB (easy to tweak to 2 or 1.5)
export const MAX_FILE_SIZE_MB = 1 * 1024 * 1024;

export const SEVEN_DAYS = 7 * 24 * 60 * 60 * 1000;

export const PRODUCTS_PER_PAGE = 3;

export const MAX_IMAGES = 5;
