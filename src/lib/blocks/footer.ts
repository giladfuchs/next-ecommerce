import type { Block } from "payload";

import { ContentBlock } from "@/lib/blocks/config";
import { linkField } from "@/lib/collections/base-fields";

export const FOOTER_ICON_OPTIONS = [
  { label: "Instagram", value: "instagram" },
  { label: "Facebook", value: "facebook" },
  { label: "TikTok", value: "tiktok" },
  { label: "LinkedIn", value: "linkedin" },
  { label: "YouTube", value: "youtube" },
  { label: "X (Twitter)", value: "x" },
  { label: "WhatsApp", value: "whatsapp" },
  { label: "Website", value: "website" },
  { label: "Phone", value: "phone" },
  { label: "Email", value: "email" },
];

export const FooterNavBlock: Block = {
  slug: "footerNav",
  interfaceName: "FooterNavBlock",
  labels: { singular: "Nav Block", plural: "Nav Blocks" },
  fields: [
    { name: "title", type: "text" },
    {
      name: "links",
      type: "array",
      maxRows: 10,
      fields: [linkField()],
    },
  ],
};

export const FooterIconsBlock: Block = {
  slug: "footerIcons",
  interfaceName: "FooterIconsBlock",
  labels: { singular: "Icons Block", plural: "Icons Blocks" },
  fields: [
    { name: "title", type: "text" },
    {
      name: "items",
      type: "array",
      maxRows: 10,
      fields: [
        {
          name: "icon",
          type: "select",
          required: true,
          options: FOOTER_ICON_OPTIONS,
        },
        linkField(),
      ],
    },
  ],
};

export const footerBlocks = [FooterNavBlock, ContentBlock, FooterIconsBlock];
