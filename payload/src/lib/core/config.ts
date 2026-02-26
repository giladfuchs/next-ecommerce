export type AppConfig = {
  BASE_URL: string;
  BLOB_READ_WRITE_TOKEN: string;
  DATABASE_URL: string;
  PREVIEW_SECRET: string;
  PAYLOAD_SECRET: string;

  SEND_EMAIL_WHATSAPP: boolean;

  EMAIL_FROM_ADDRESS: string;
  EMAIL_SMTP_HOST: string;
  EMAIL_SMTP_PORT: number;
  EMAIL_SMTP_USER: string;
  EMAIL_SMTP_PASS: string;

  CALLMEBOT_API_KEY: string;
  WHATSAPP_NUMBER: string;

  GOOGLE_SITE_VERIFICATION?: string;
  GOOGLE_ANALYTICS?: string;
  GOOGLE_ADS?: string;
  TIKTOK_PIXEL?: string;
  META_PIXEL?: string;
};

export const appConfig: AppConfig = {
  BLOB_READ_WRITE_TOKEN: process.env.BLOB_READ_WRITE_TOKEN as string,
  BASE_URL: process.env.NEXT_PUBLIC_BASE_URL as string,
  DATABASE_URL: process.env.DATABASE_URL as string,
  PREVIEW_SECRET: process.env.PREVIEW_SECRET as string,
  PAYLOAD_SECRET: process.env.PAYLOAD_SECRET as string,

  SEND_EMAIL_WHATSAPP: process.env.SEND_EMAIL_WHATSAPP === "true",

  EMAIL_FROM_ADDRESS: process.env.EMAIL_FROM_ADDRESS as string,
  EMAIL_SMTP_HOST: process.env.EMAIL_SMTP_HOST as string,
  EMAIL_SMTP_PORT: Number(process.env.EMAIL_SMTP_PORT || 587),
  EMAIL_SMTP_USER: process.env.EMAIL_SMTP_USER as string,
  EMAIL_SMTP_PASS: process.env.EMAIL_SMTP_PASS as string,

  CALLMEBOT_API_KEY: process.env.CALLMEBOT_API_KEY as string,
  WHATSAPP_NUMBER: process.env.WHATSAPP_NUMBER as string,

  GOOGLE_SITE_VERIFICATION: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION,
  GOOGLE_ANALYTICS: process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS,
  GOOGLE_ADS: process.env.NEXT_PUBLIC_GOOGLE_ADS,
  TIKTOK_PIXEL: process.env.NEXT_PUBLIC_TIKTOK_PIXEL,
  META_PIXEL: process.env.NEXT_PUBLIC_META_PIXEL,
};

export default appConfig;
