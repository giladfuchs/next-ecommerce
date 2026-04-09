import type { CollectionConfig } from "payload";

import {
  DESCRIPTION_FIELD,
  FAQS_FIELD,
  makeAdminPreview,
  adminOnlyAccess,
  mixedSlugField,
} from "@/lib/collections/base-fields";
import {
  makeRevalidateHooks,
  normalizeFaqs,
  reorderCategoryPositions,
} from "@/lib/collections/hooks";
import { CollectionName, RoutePath } from "@/lib/core/types/types";

export const Category: CollectionConfig = {
  slug: RoutePath.category,
  versions: {
    drafts: true,
  },
  access: {
    ...adminOnlyAccess,
    read: () => true,
  },

  admin: {
    useAsTitle: "title",
    group: "Content",
    defaultColumns: ["title", "position", "slug", "updatedAt"],
    ...makeAdminPreview(RoutePath.category),
  },
  hooks: {
    beforeValidate: [
      ({ data }) => {
        return normalizeFaqs(data as { faqs?: unknown });
      },
    ],
    afterChange: [
      reorderCategoryPositions,
      ...makeRevalidateHooks(CollectionName.category).afterChange,
    ],
    afterDelete: makeRevalidateHooks(CollectionName.category).afterDelete,
  },
  fields: [
    { name: "title", type: "text", required: true, localized: true },

    {
      name: "position",
      type: "number",
      required: true,
      defaultValue: 0,
      min: 0,
    },
    { name: "image", type: "upload", relationTo: "media", required: true },

    DESCRIPTION_FIELD,
    mixedSlugField(),
    FAQS_FIELD,
  ],
};
