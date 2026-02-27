import { revalidateTag } from "next/cache";

import type { GlobalConfig } from "payload";

import {
  adminOnlyAccess,
  DESCRIPTION_FIELD,
  FAQS_FIELD,
  normalizeFaqs,
} from "@/lib/collections/base";

export const SiteSettings: GlobalConfig = {
  slug: "site-settings",
  access: {
    ...adminOnlyAccess,
    read: () => true,
  },

  admin: { group: "Content" },
  hooks: {
    beforeValidate: [
      ({ data }) => {
        if (!data) return data;
        if (data.home) {
          data.home = normalizeFaqs(data.home as { faqs?: unknown });
        }
        return data;
      },
    ],
    afterChange: [
      async () => {
        try {
          revalidateTag("site-settings", "max");
        } catch {}
      },
    ],
  },
  endpoints: [
    {
      path: "/revalidate-bootstrap",
      method: "post",
      handler: async () => {
        try {
          revalidateTag("bootstrap", "max");
          return Response.json({ ok: true });
        } catch {
          return Response.json({ ok: false }, { status: 500 });
        }
      },
    },
  ],

  fields: [
    {
      type: "tabs",
      tabs: [
        {
          label: "Main",
          fields: [
            {
              name: "revalidate",
              type: "ui",
              admin: {
                components: {
                  Field: "@/components/shared/elements-client#RevalidateField",
                },
              },
            },
            {
              name: "home",
              label: "Home",
              type: "group",
              fields: [
                {
                  name: "title",
                  required: true,
                  label: "Site Title (Homepage & Meta Default)",
                  type: "text",
                  admin: {
                    description:
                      "Main website title. Used on homepage and as default meta title.",
                  },
                },
                DESCRIPTION_FIELD,
                {
                  name: "image_meta",
                  type: "upload",
                  relationTo: "media",
                  required: true,
                },
                { name: "logo", type: "upload", relationTo: "media" },
                FAQS_FIELD,
              ],
            },
          ],
        },
        {
          label: "Footer",
          fields: [
            {
              name: "footer",
              type: "group",
              fields: [
                { name: "title", type: "text" },
                { name: "address", type: "text" },
                { name: "phone", type: "text" },
                { name: "email", type: "email" },
                { name: "website", type: "text" },
                {
                  name: "social",
                  type: "group",
                  fields: [
                    { name: "instagram", type: "text" },
                    { name: "facebook", type: "text" },
                    { name: "whatsappNumber", type: "text" },
                    { name: "whatsappMessage", type: "text" },
                  ],
                },
              ],
            },
          ],
        },
      ],
    },
  ],
};
