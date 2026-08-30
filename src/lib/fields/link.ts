import type { Field, GroupField } from "payload";

import { CollectionName } from "@/lib/core/types/types";

const linkFields = ({
  appearances,
}: {
  appearances?: Array<"default" | "outline">;
} = {}): Field[] => [
  {
    name: "type",
    type: "radio",
    defaultValue: "reference",
    options: [
      { label: "Internal link", value: "reference" },
      { label: "Custom URL", value: "custom" },
    ],
  },
  {
    name: "reference",
    type: "relationship",
    relationTo: [
      CollectionName.pages,
      CollectionName.products,
      CollectionName.category,
    ],
    required: true,
    admin: {
      condition: (_data, siblingData) => siblingData?.type === "reference",
    },
  },
  {
    name: "url",
    type: "text",
    required: true,
    admin: {
      condition: (_data, siblingData) => siblingData?.type === "custom",
    },
  },
  {
    name: "label",
    type: "text",
    required: true,
    localized: true,
  },
  {
    name: "newTab",
    type: "checkbox",
    label: "Open in a new tab",
  },
  ...(appearances
    ? [
        {
          name: "appearance",
          type: "select",
          defaultValue: "default",
          options: appearances.map((appearance) => ({
            label: appearance === "default" ? "Default" : "Outline",
            value: appearance,
          })),
        } satisfies Field,
      ]
    : []),
];

export const linkField = (
  appearances?: Array<"default" | "outline">,
): GroupField => ({
  name: "link",
  type: "group",
  fields: linkFields({ appearances }),
});
