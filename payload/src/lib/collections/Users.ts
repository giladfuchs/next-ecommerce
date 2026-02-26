import type { CollectionConfig } from "payload";

import { isAdmin } from "@/lib/core/util";

export const Users: CollectionConfig = {
  slug: "users",
  admin: {
    hidden: true,
    useAsTitle: "email",
    group: "Internal",
    defaultColumns: ["email"],
  },
  auth: true,
  access: {
    read: ({ req: { user } }) => Boolean(user),
    create: () => false,
    delete: () => false,
    update: isAdmin,
    admin: isAdmin,
  },
  fields: [
    {
      name: "roles",
      type: "select",
      hasMany: true,
      defaultValue: ["admin"],
      options: [
        { label: "admin", value: "admin" },
        { label: "customer", value: "customer" },
      ],
      admin: {
        hidden: true,
      },
    },
  ],
};
