import type { CollectionConfig } from "payload";

import { pageBlocks } from "@/lib/blocks/config";
import { hero } from "@/lib/blocks/hero";
import {
  adminOnlyAccess,
  makeAdminPreview,
  metaTab,
  mixedSlugField,
} from "@/lib/collections/base-fields";
import { makeRevalidateHooks, normalizeFaqs } from "@/lib/collections/hooks";
import { CollectionName, RoutePath } from "@/lib/core/types/types";

const RESERVED_PAGE_SLUGS = [
  "admin",
  "api",
  "category",
  "checkout",
  "preview",
  "product",
];

export const Pages: CollectionConfig = {
  slug: CollectionName.pages,
  defaultPopulate: {
    title: true,
    slug: true,
  },
  versions: {
    drafts: {
      autosave: {
        interval: 500,
      },
    },
  },
  access: {
    ...adminOnlyAccess,
    read: ({ req }) =>
      req.user
        ? true
        : {
            _status: {
              equals: "published",
            },
          },
  },
  admin: {
    useAsTitle: "title",
    group: "Content",
    defaultColumns: ["title", "slug", "_status", "updatedAt"],
    ...makeAdminPreview(RoutePath.page),
  },
  hooks: {
    beforeValidate: [
      ({ data }) => {
        if (!data || !Array.isArray(data.layout)) return data;

        data.layout = data.layout.map((block: unknown) => {
          if (
            !block ||
            typeof block !== "object" ||
            !("blockType" in block) ||
            block.blockType !== "faq"
          ) {
            return block;
          }

          return normalizeFaqs(block as { faqs?: unknown });
        });

        return data;
      },
    ],
    ...makeRevalidateHooks(CollectionName.pages),
  },
  fields: [
    {
      name: "title",
      type: "text",
      required: true,
      localized: true,
    },
    {
      type: "tabs",
      tabs: [
        {
          label: "Hero",
          fields: [hero],
        },
        {
          label: "Content",
          fields: [
            {
              name: "layout",
              type: "blocks",
              blocks: pageBlocks,
              required: true,
              minRows: 1,
              admin: {
                initCollapsed: true,
              },
            },
          ],
        },
        metaTab(),
      ],
    },
    mixedSlugField(RESERVED_PAGE_SLUGS),
  ],
};
