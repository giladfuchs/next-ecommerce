import path from "path";
import { fileURLToPath } from "url";

import type { CollectionConfig } from "payload";

import { adminOnlyAccess } from "@/lib/collections/base";
import appConfig from "@/lib/core/config";

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

export const Media: CollectionConfig = {
  admin: {
    group: "Content",
  },
  slug: "media",
  access: {
    ...adminOnlyAccess,
    read: () => true,
  },
  fields: [
    {
      name: "alt",
      type: "text",
      required: true,
    },
  ],
  upload: Boolean(appConfig.BLOB_READ_WRITE_TOKEN)
    ? true
    : { staticDir: path.resolve(dirname, "../../public/media") },
};
