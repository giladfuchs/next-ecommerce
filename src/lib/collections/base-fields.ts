import {
  BoldFeature,
  EXPERIMENTAL_TableFeature,
  FixedToolbarFeature,
  HeadingFeature,
  HorizontalRuleFeature,
  IndentFeature,
  InlineToolbarFeature,
  ItalicFeature,
  LinkFeature,
  OrderedListFeature,
  ParagraphFeature,
  UnderlineFeature,
  UnorderedListFeature,
  lexicalEditor,
} from "@payloadcms/richtext-lexical";
import { slugField } from "payload";

import type { User } from "@/payload-types";
import type { PayloadRequest, CollectionAdminOptions, Field } from "payload";

import { CollectionName, RoutePath } from "@/lib/core/types/types";
import { generatePreviewPath } from "@/lib/core/util";

type AdminConfig = {
  components?: Record<string, unknown>;
} & Record<string, unknown>;

export const baseEditor = lexicalEditor({
  features: () => [
    ParagraphFeature(),
    UnderlineFeature(),
    BoldFeature(),
    ItalicFeature(),
    OrderedListFeature(),
    UnorderedListFeature(),
    IndentFeature(),
    EXPERIMENTAL_TableFeature(),
    HeadingFeature({ enabledHeadingSizes: ["h1", "h2", "h3", "h4"] }),
    FixedToolbarFeature(),
    InlineToolbarFeature(),
    HorizontalRuleFeature(),
    LinkFeature({
      enabledCollections: [
        CollectionName.pages,
        CollectionName.products,
        CollectionName.category,
      ],
    }),
  ],
});

export const pageEditor = lexicalEditor({
  features: () => [
    ParagraphFeature(),
    UnderlineFeature(),
    BoldFeature(),
    ItalicFeature(),
    OrderedListFeature(),
    UnorderedListFeature(),
    IndentFeature(),
    EXPERIMENTAL_TableFeature(),
    HeadingFeature({ enabledHeadingSizes: ["h2", "h3", "h4"] }),
    FixedToolbarFeature(),
    InlineToolbarFeature(),
    HorizontalRuleFeature(),
    LinkFeature({
      enabledCollections: [
        CollectionName.pages,
        CollectionName.products,
        CollectionName.category,
      ],
    }),
  ],
});

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

export const mixedSlugField = (reservedSlugs: string[] = []) =>
  slugField({
    useAsSlug: "title",
    slugify: slugifyMixed,
    overrides: (field) => {
      if (!reservedSlugs.length) return field;

      const reserved = new Set(
        reservedSlugs.map((slug) => slug.trim().toLowerCase()),
      );

      field.fields = field.fields.map((subField) => {
        if (subField.type !== "text" || subField.name !== "slug") {
          return subField;
        }

        const validatedSlugField: Field = {
          ...subField,
          validate: (value: unknown) => {
            if (typeof value !== "string" || !value.trim()) {
              return "Slug is required.";
            }

            if (reserved.has(value.trim().toLowerCase())) {
              return `The slug \"${value}\" is reserved by the storefront.`;
            }

            return true;
          },
        };

        return validatedSlugField;
      });

      return field;
    },
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

export const patchPriceRowFields = (
  fields: Field[],
  priceRequired: boolean = true,
): Field[] => {
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
        if (!priceRequired) {
          return {
            ...sub,
            defaultValue: false,
            label: "Use a custom price for this variant",
            admin: {
              ...((sub as { admin?: Record<string, unknown> }).admin || {}),
              description:
                "Leave disabled to inherit the product price. Enable only when this combination costs more or less.",
            },
          } as Field;
        }

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
          required: priceRequired,
          min: 0,
          admin: priceRequired
            ? stripAdminFieldComponent(sub.admin)
            : sub.admin,
        } as Field;
      }

      return sub;
    });

    return { ...row, fields: patched } as Field;
  });
};

export const patchPricesGroupField = (
  group: Field,
  priceRequired: boolean = true,
): Field => {
  if (group.type !== "group") return group;

  const fields = Array.isArray((group as { fields?: Field[] }).fields)
    ? (group as { fields: Field[] }).fields
    : [];
  return {
    ...group,
    fields: patchPriceRowFields(fields, priceRequired),
  } as Field;
};
export const DESCRIPTION_FIELD: Field = {
  name: "description",
  type: "richText",
  editor: baseEditor,
  label: false,
  required: true,
};

export function makeAdminPreview(
  collection: RoutePath,
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
const checkRole = (
  allRoles: User["roles"] = [],
  user?: User | null,
): boolean => {
  if (user && allRoles) {
    return allRoles.some((role) => {
      return user?.roles?.some((individualRole) => {
        return individualRole === role;
      });
    });
  }

  return false;
};

export const isAdmin = ({ req: { user } }: { req: PayloadRequest }) => {
  return user ? checkRole(["admin"], user) : false;
};

export const adminOnlyAccess = {
  read: isAdmin,
  create: isAdmin,
  update: isAdmin,
  delete: isAdmin,
  admin: isAdmin,
};

export const FAQS_FIELD: Field = {
  name: "faqs",
  label: "FAQs",
  type: "array",
  labels: {
    singular: "FAQ",
    plural: "FAQs",
  },
  fields: [
    {
      name: "question",
      label: "Question",
      type: "text",
      required: true,
      localized: true,
    },
    {
      name: "answer",
      label: "Answer",
      type: "textarea",
      required: true,
      localized: true,
    },
  ],
};
