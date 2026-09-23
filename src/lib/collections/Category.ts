import type { CollectionConfig } from "payload";

import {
  DESCRIPTION_FIELD,
  FAQS_FIELD,
  makeAdminPreview,
  adminOnlyAccess,
  metaTab,
  mixedSlugField,
} from "@/lib/collections/base-fields";
import { makeRevalidateHooks, normalizeFaqs } from "@/lib/collections/hooks";
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
    defaultColumns: ["title", "slug", "updatedAt"],
    ...makeAdminPreview(RoutePath.category),
  },
  hooks: {
    beforeValidate: [
      ({ data }) => {
        return normalizeFaqs(data as { faqs?: unknown });
      },
    ],
    afterChange: makeRevalidateHooks(CollectionName.category).afterChange,
    afterDelete: makeRevalidateHooks(CollectionName.category).afterDelete,
  },
  fields: [
    { name: "title", type: "text", required: true, localized: true },
    {
      type: "tabs",
      tabs: [
        {
          label: "Category details",
          fields: [DESCRIPTION_FIELD, FAQS_FIELD],
        },
        metaTab(),
      ],
    },
    mixedSlugField(),
  ],
};
