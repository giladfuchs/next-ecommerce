import {
  MetaDescriptionField,
  MetaImageField,
  MetaTitleField,
  OverviewField,
  PreviewField,
} from "@payloadcms/plugin-seo/fields";

import type { CollectionConfig } from "payload";

import { pageBlocks } from "@/lib/blocks/config";
import {
  adminOnlyAccess,
  makeAdminPreview,
  mixedSlugField,
} from "@/lib/collections/base-fields";
import { makeRevalidateHooks, normalizeFaqs } from "@/lib/collections/hooks";
import { CollectionName, RoutePath } from "@/lib/core/types/types";
import { hero } from "@/lib/heros/config";

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
        {
          name: "meta",
          label: "SEO",
          fields: [
            OverviewField({
              titlePath: "meta.title",
              descriptionPath: "meta.description",
              imagePath: "meta.image",
            }),
            MetaTitleField({
              hasGenerateFn: true,
              overrides: {
                required: true,
              },
            }),
            MetaImageField({
              relationTo: "media",
              overrides: {
                required: true,
              },
            }),
            MetaDescriptionField({
              overrides: {
                required: true,
              },
            }),
            PreviewField({
              hasGenerateFn: true,
              titlePath: "meta.title",
              descriptionPath: "meta.description",
            }),
          ],
        },
      ],
    },
    mixedSlugField(RESERVED_PAGE_SLUGS),
  ],
};
