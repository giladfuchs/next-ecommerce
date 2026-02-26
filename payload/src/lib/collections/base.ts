import {
  FixedToolbarFeature,
  HeadingFeature,
  HorizontalRuleFeature,
  InlineToolbarFeature,
  lexicalEditor,
} from "@payloadcms/richtext-lexical";
import { revalidateTag } from "next/cache";
import { slugField } from "payload";

import type {
  CollectionAdminOptions,
  Field,
  CollectionAfterChangeHook,
  CollectionAfterDeleteHook,
} from "payload";

import { CollectionSlug } from "@/lib/core/types/types";
import { generatePreviewPath, isAdmin } from "@/lib/core/util";

type AdminConfig = {
  components?: Record<string, unknown>;
} & Record<string, unknown>;

const pickString = (v: unknown): string => {
  if (typeof v === "string") return v;

  if (v && typeof v === "object") {
    const obj = v as Record<string, unknown>;

    const he = obj.he;
    if (typeof he === "string" && he.trim()) return he;

    const en = obj.en;
    if (typeof en === "string" && en.trim()) return en;

    for (const val of Object.values(obj)) {
      if (typeof val === "string" && val.trim()) return val;
    }
  }

  return "";
};

const slugifyMixed = (input: unknown) =>
  pickString(input)
    .trim()
    .toLowerCase()
    .replace(/[\u0591-\u05C7]/g, "")
    .replace(/[^\p{L}\p{N}]+/gu, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

export const mixedSlugField = () =>
  slugField({
    useAsSlug: "title",
    slugify: slugifyMixed,
  });

export const stripAdminFieldComponent = (
  admin?: AdminConfig,
): AdminConfig | undefined => {
  if (!admin?.components) return admin;

  const components = { ...admin.components };
  delete components["Field"];
  return { ...admin, components };
};

const lowerName = (f: Field) => {
  const name = (f as { name?: unknown }).name;
  return typeof name === "string" ? name.toLowerCase() : "";
};

export const patchPriceRowFields = (fields: Field[]): Field[] => {
  return fields.map((row) => {
    if (
      row.type !== "row" ||
      !Array.isArray((row as { fields?: Field[] }).fields)
    )
      return row;

    const rowFields = (row as { fields: Field[] }).fields;

    const patched = rowFields.map((sub) => {
      const name = lowerName(sub);

      if (
        sub.type === "checkbox" &&
        name.includes("enable") &&
        name.includes("price")
      ) {
        return {
          ...sub,
          defaultValue: true,
          admin: {
            ...((sub as { admin?: Record<string, unknown> }).admin || {}),
            hidden: true,
            condition: () => false,
            readOnly: true,
            disabled: true,
          },
        } as Field;
      }

      if (sub.type === "number" && name.includes("price")) {
        return {
          ...sub,
          required: true,
          min: 0,
          admin: stripAdminFieldComponent(sub.admin),
        } as Field;
      }

      return sub;
    });

    return { ...row, fields: patched } as Field;
  });
};

export const patchPricesGroupField = (group: Field): Field => {
  if (group.type !== "group") return group;

  const fields = Array.isArray((group as { fields?: Field[] }).fields)
    ? (group as { fields: Field[] }).fields
    : [];
  return { ...group, fields: patchPriceRowFields(fields) } as Field;
};
export const DESCRIPTION_FIELD: Field = {
  name: "description",
  type: "richText",
  editor: lexicalEditor({
    features: ({ rootFeatures }) => [
      ...rootFeatures,
      HeadingFeature({ enabledHeadingSizes: ["h1", "h2", "h3", "h4"] }),
      FixedToolbarFeature(),
      InlineToolbarFeature(),
      HorizontalRuleFeature(),
    ],
  }),
  label: false,
  required: true,
};
export function makeRevalidateHooks(collection: CollectionSlug): {
  afterChange: CollectionAfterChangeHook[];
  afterDelete: CollectionAfterDeleteHook[];
} {
  return {
    afterChange: [
      async ({ doc, previousDoc }) => {
        try {
          const newSlug = doc?.slug ? String(doc.slug) : "";
          const prevSlug = previousDoc?.slug ? String(previousDoc.slug) : "";

          if (prevSlug) revalidateTag(`${collection}-${prevSlug}`, "max");
          if (newSlug) revalidateTag(`${collection}-${newSlug}`, "max");
        } catch {}
      },
    ],
    afterDelete: [
      async ({ doc }) => {
        try {
          const slug = doc?.slug ? String(doc.slug) : "";
          if (slug) revalidateTag(`${collection}-${slug}`, "max");
        } catch {}
      },
    ],
  };
}
export function makeAdminPreview(
  collection: CollectionSlug,
): Pick<NonNullable<CollectionAdminOptions>, "livePreview" | "preview"> {
  return {
    livePreview: {
      url: ({ data }) =>
        generatePreviewPath({
          collection,
          slug: typeof data?.slug === "string" ? data.slug : "",
        }),
    },

    preview: (data) =>
      generatePreviewPath({
        collection,
        slug: typeof data?.slug === "string" ? data.slug : "",
      }),
  };
}
export const adminOnlyAccess = {
  read: isAdmin,
  create: isAdmin,
  update: isAdmin,
  delete: isAdmin,
  admin: isAdmin,
};
