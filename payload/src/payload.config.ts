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

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

export default buildConfig({
  admin: {
    user: Users.slug,
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
  endpoints: [],
  plugins,
  secret: appConfig.PAYLOAD_SECRET,
  typescript: {
    outputFile: path.resolve(dirname, "lib/core/types/payload-types.ts"),
  },
});
