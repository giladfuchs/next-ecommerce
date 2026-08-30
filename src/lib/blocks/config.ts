import type { Block, Field } from "payload";

import { FAQS_FIELD, pageEditor } from "@/lib/collections/base-fields";
import { CollectionName } from "@/lib/core/types/types";
import { linkField } from "@/lib/fields/link";

export const contentColumnFields: Field[] = [
  {
    name: "size",
    type: "select",
    defaultValue: "full",
    required: true,
    options: [
      { label: "One Third", value: "oneThird" },
      { label: "Half", value: "half" },
      { label: "Two Thirds", value: "twoThirds" },
      { label: "Full", value: "full" },
    ],
  },
  {
    name: "richText",
    type: "richText",
    editor: pageEditor,
    label: false,
  },
  {
    name: "enableLink",
    type: "checkbox",
    label: "Add a link",
  },
  {
    ...linkField(),
    admin: {
      condition: (_data, siblingData) => Boolean(siblingData?.enableLink),
    },
  },
];

export const ContentBlock: Block = {
  slug: "content",
  interfaceName: "ContentBlock",
  fields: [
    {
      name: "columns",
      type: "array",
      minRows: 1,
      maxRows: 4,
      admin: { initCollapsed: true },
      fields: contentColumnFields,
    },
  ],
};

export const CallToActionBlock: Block = {
  slug: "cta",
  interfaceName: "CallToActionBlock",
  labels: {
    singular: "Call to Action",
    plural: "Calls to Action",
  },
  fields: [
    {
      name: "richText",
      type: "richText",
      editor: pageEditor,
      label: false,
    },
    {
      name: "links",
      type: "array",
      maxRows: 2,
      fields: [linkField(["default", "outline"])],
    },
  ],
};

export const ArchiveBlock: Block = {
  slug: "archive",
  interfaceName: "ArchiveBlock",
  labels: {
    singular: "Archive",
    plural: "Archives",
  },
  fields: [
    {
      name: "introContent",
      type: "richText",
      editor: pageEditor,
      label: "Intro Content",
    },
    {
      name: "introAlignment",
      type: "select",
      defaultValue: "center",
      required: true,
      label: "Intro Alignment",
      options: [
        { label: "Start", value: "start" },
        { label: "Center", value: "center" },
      ],
    },
    {
      name: "contentType",
      type: "select",
      defaultValue: "products",
      required: true,
      label: "Content Type",
      options: [
        { label: "Products", value: "products" },
        { label: "Pages", value: "pages" },
        { label: "Categories", value: "categories" },
      ],
    },
    {
      name: "displayMode",
      type: "select",
      defaultValue: "grid",
      required: true,
      label: "Display",
      options: [
        { label: "Grid", value: "grid" },
        { label: "Auto-scrolling row", value: "autoScroll" },
      ],
    },
    {
      name: "populateBy",
      type: "select",
      defaultValue: "collection",
      required: true,
      options: [
        { label: "Published entries", value: "collection" },
        { label: "Individual selection", value: "selection" },
      ],
    },
    {
      name: "categories",
      type: "relationship",
      relationTo: CollectionName.category,
      hasMany: true,
      label: "Categories to show",
      admin: {
        condition: (_data, siblingData) =>
          siblingData?.populateBy === "collection" &&
          siblingData?.contentType === "products",
      },
    },
    {
      name: "limit",
      type: "number",
      min: 1,
      max: 24,
      defaultValue: 10,
      label: "Maximum items",
      admin: {
        condition: (_data, siblingData) =>
          siblingData?.populateBy === "collection",
        step: 1,
      },
    },
    {
      name: "selectedDocs",
      type: "relationship",
      relationTo: CollectionName.products,
      hasMany: true,
      label: "Products",
      admin: {
        condition: (_data, siblingData) =>
          siblingData?.populateBy === "selection" &&
          siblingData?.contentType === "products",
        sortOptions: "title",
      },
    },
    {
      name: "selectedPages",
      type: "relationship",
      relationTo: CollectionName.pages,
      hasMany: true,
      label: "Pages",
      admin: {
        condition: (_data, siblingData) =>
          siblingData?.populateBy === "selection" &&
          siblingData?.contentType === "pages",
        sortOptions: "title",
      },
    },
    {
      name: "selectedCategories",
      type: "relationship",
      relationTo: CollectionName.category,
      hasMany: true,
      label: "Categories",
      admin: {
        condition: (_data, siblingData) =>
          siblingData?.populateBy === "selection" &&
          siblingData?.contentType === "categories",
        sortOptions: "title",
      },
    },
  ],
};

export const FaqBlock: Block = {
  slug: "faq",
  interfaceName: "FaqBlock",
  labels: {
    singular: "FAQ",
    plural: "FAQs",
  },
  fields: [FAQS_FIELD],
};

export const HtmlEmbedBlock: Block = {
  slug: "htmlEmbed",
  interfaceName: "HtmlEmbedBlock",
  fields: [
    {
      name: "contentHtml",
      label: "HTML",
      type: "code",
      required: true,
      admin: {
        language: "html",
      },
    },
  ],
  labels: {
    singular: "HTML Embed",
    plural: "HTML Embeds",
  },
};

export const pageBlocks = [
  CallToActionBlock,
  ArchiveBlock,
  FaqBlock,
  ContentBlock,
  HtmlEmbedBlock,
];
