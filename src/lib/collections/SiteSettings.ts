import type { GlobalConfig } from "payload";

import { footerBlocks } from "@/lib/blocks/footer";
import { adminOnlyAccess, linkField } from "@/lib/collections/base-fields";
import { revalidate } from "@/lib/collections/hooks";
import { AppConst } from "@/lib/core/types/types";

export const SiteSettings: GlobalConfig = {
  slug: "site-settings",
  access: {
    ...adminOnlyAccess,
    read: () => true,
  },

  admin: { group: "Content" },
  hooks: {
    afterChange: [
      async () => {
        try {
          revalidate("site-settings");
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
          revalidate(AppConst.CACHE_TAG_BOOTSTRAP);
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
          name: "general",
          label: "General",
          fields: [
            {
              name: "revalidate",
              type: "ui",
              admin: {
                components: {
                  Field: "@/components/admin#RevalidateField",
                },
              },
            },
            {
              name: "logo",
              label: "Logo",
              type: "upload",
              relationTo: "media",
              required: true,
            },
          ],
        },
        {
          name: "header",
          label: "Header",
          fields: [
            {
              name: "navItems",
              type: "array",
              maxRows: 8,
              fields: [linkField()],
            },
          ],
        },
        {
          name: "footer",
          label: "Footer",
          fields: [
            {
              name: "blocks",
              type: "blocks",
              blocks: footerBlocks,
              admin: { initCollapsed: true },
            },
          ],
        },
      ],
    },
  ],
};
