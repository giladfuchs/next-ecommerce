import type { Field } from "payload";

import { baseEditor, linkField } from "@/lib/collections/base-fields";

export const hero: Field = {
  name: "hero",
  type: "group",
  label: false,
  fields: [
    {
      name: "type",
      type: "select",
      defaultValue: "lowImpact",
      label: "Type",
      required: true,
      options: [
        { label: "None", value: "none" },
        { label: "High Impact", value: "highImpact" },
        { label: "Medium Impact", value: "mediumImpact" },
        { label: "Low Impact", value: "lowImpact" },
      ],
    },
    {
      name: "richText",
      type: "richText",
      editor: baseEditor,
      label: false,
    },
    {
      name: "links",
      type: "array",
      maxRows: 2,
      fields: [linkField(["default", "outline"])],
    },
    {
      name: "media",
      type: "upload",
      relationTo: "media",
      required: true,
      admin: {
        condition: (_data, siblingData) =>
          ["highImpact", "mediumImpact"].includes(siblingData?.type),
      },
    },
  ],
};
