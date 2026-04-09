import path from "path";
import { fileURLToPath } from "url";

import { postgresAdapter } from "@payloadcms/db-postgres";
import { nodemailerAdapter } from "@payloadcms/email-nodemailer";
import {
  BoldFeature,
  EXPERIMENTAL_TableFeature,
  IndentFeature,
  ItalicFeature,
  LinkFeature,
  OrderedListFeature,
  UnderlineFeature,
  UnorderedListFeature,
  lexicalEditor,
} from "@payloadcms/richtext-lexical";
import { buildConfig } from "payload";

import {
  Media,
  SiteSettings,
  Category,
  Users,
  Reviews,
} from "@/lib/collections";
import appConfig from "@/lib/core/config";
import { plugins } from "@/lib/providers/plugins";

export default buildConfig({
  admin: {
    user: Users.slug,
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

  collections: [Users, Category, Media, Reviews],
  db: postgresAdapter({
    pool: {
      connectionString: appConfig.DATABASE_URL,
    },
  }),
  editor: lexicalEditor({
    features: () => {
      return [
        UnderlineFeature(),
        BoldFeature(),
        ItalicFeature(),
        OrderedListFeature(),
        UnorderedListFeature(),
        LinkFeature({
          enabledCollections: [],
        }),
        IndentFeature(),
        EXPERIMENTAL_TableFeature(),
      ];
    },
  }),
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
  plugins,
  secret: appConfig.PAYLOAD_SECRET,
  typescript: {
    outputFile: path.resolve(
      path.dirname(fileURLToPath(import.meta.url)),
      "lib/core/types/payload-types.ts",
    ),
  },
});
