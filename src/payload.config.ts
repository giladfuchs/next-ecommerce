import path from "path";
import { fileURLToPath } from "url";

import { postgresAdapter } from "@payloadcms/db-postgres";
import { nodemailerAdapter } from "@payloadcms/email-nodemailer";
import { buildConfig } from "payload";
import { en } from "payload/i18n/en";
import { he } from "payload/i18n/he";
import sharp from "sharp";

import {
  GalleryMedia,
  Media,
  Pages,
  SeoMedia,
  SiteSettings,
  Category,
  Users,
  Reviews,
} from "@/lib/collections";
import { baseEditor } from "@/lib/collections/base-fields";
import appConfig from "@/lib/core/config";
import { plugins } from "@/lib/providers/plugins";
import { stripeEndpoints } from "@/lib/stripe/endpoints";

export default buildConfig({
  admin: {
    user: Users.slug,
    components: {
      beforeNavLinks: [
        "@/components/admin/dashboard-nav-link#DashboardNavLink",
      ],
      views: {
        dashboard: {
          Component: "@/components/admin/order-dashboard#OrderDashboard",
        },
      },
    },
    livePreview: {
      breakpoints: [
        {
          label: "Mobile",
          name: "mobile",
          width: 375,
          height: 667,
        },
        {
          label: "Tablet",
          name: "tablet",
          width: 768,
          height: 1024,
        },
        {
          label: "Desktop",
          name: "desktop",
          width: 1440,
          height: 900,
        },
      ],
    },
  },
  globals: [SiteSettings],

  i18n: {
    fallbackLanguage: appConfig.LOCAL.lang,
    supportedLanguages: appConfig.LOCAL.lang === "he" ? { he } : { en },
  },

  sharp,

  collections: [Users, Pages, Category, Media, SeoMedia, GalleryMedia, Reviews],
  db: postgresAdapter({
    pool: {
      connectionString: appConfig.DATABASE_URL,
    },
  }),
  editor: baseEditor,
  email: appConfig.SEND_EMAIL_WHATSAPP
    ? nodemailerAdapter({
        defaultFromAddress: appConfig.EMAIL_FROM_ADDRESS,
        defaultFromName: "My Store",
        transportOptions: {
          host: appConfig.EMAIL_SMTP_HOST,
          port: Number(appConfig.EMAIL_SMTP_PORT || 587),
          secure: false,
          auth: {
            user: appConfig.EMAIL_SMTP_USER,
            pass: appConfig.EMAIL_SMTP_PASS,
          },
        },
      })
    : undefined,
  cors: [appConfig.BASE_URL],
  endpoints: stripeEndpoints,
  plugins,
  secret: appConfig.PAYLOAD_SECRET,
  typescript: {
    outputFile: path.resolve(
      path.dirname(fileURLToPath(import.meta.url)),
      "lib/core/types/payload-types.ts",
    ),
  },
});
