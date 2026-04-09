import * as Yup from "yup";

import { localeCache } from "../config";

import { FormType, ModelType } from "./enums";

import type { ProductImage } from "./entities";
import type { IntlShape } from "react-intl";

export type FieldValue = string | number | boolean | null;

// -- Admin Mui Form--
export class FieldInput {
  constructor(
    public type: FormType,
    public key: string,
    public value: FieldValue = "",
  ) {}
}

export class FieldAutoComplete {
  readonly type: FormType = FormType.AutoComplete;
  public value: FieldValue;

  constructor(
    public key: string,
    public options: FieldValue[],
    value?: FieldValue,
  ) {
    this.value = value ?? options[0] ?? "";
  }
}

export class FieldImages {
  readonly type: FormType = FormType.ImagesEditor;

  constructor(
    public key: string,
    public value: ProductImage[] = [],
  ) {}
}

export type FormField = FieldAutoComplete | FieldInput | FieldImages;

export const product_fields: FormField[] = [
  new FieldInput(FormType.TEXT, "title"),
  new FieldInput(FormType.NUMBER, "price"),
  new FieldInput(FormType.TEXTAREA, "description"),
  new FieldAutoComplete("category", []),
  new FieldInput(FormType.Switch, "available", true),
  new FieldImages("images", []),
];

export const category_fields: FormField[] = [
  new FieldInput(FormType.TEXT, "title"),
  new FieldInput(FormType.NUMBER, "position"),
];

export const get_form_by_model = (model: ModelType): FormField[] => {
  switch (model) {
    case ModelType.product:
      return [...product_fields];
    case ModelType.category:
    default:
      return [...category_fields];
  }
};

export const create_form_fields = (
  source: FormField[],
  target: Record<string, FieldValue | ProductImage[] | undefined> | null,
): FormField[] => {
  const isEmptyTarget =
    target == null ||
    (typeof target === "object" &&
      !Array.isArray(target) &&
      Object.keys(target).length === 0);

  if (isEmptyTarget) {
    return source.map((field) => {
      if (field instanceof FieldImages) {
        return new FieldImages(field.key, field.value);
      }
      if (field instanceof FieldAutoComplete) {
        return new FieldAutoComplete(field.key, field.options, field.value);
      }
      return new FieldInput(field.type, field.key, field.value);
    });
  }

  return source.map((field) => {
    const updatedValue = target?.[field.key];

    if (field instanceof FieldImages && Array.isArray(updatedValue)) {
      return new FieldImages(field.key, updatedValue);
    }

    if (field instanceof FieldAutoComplete) {
      return new FieldAutoComplete(
        field.key,
        field.options,
        (updatedValue as FieldValue) ?? "",
      );
    }

    const cleanedValue: FieldValue =
      typeof updatedValue === "string"
        ? updatedValue.trim()
        : (updatedValue as FieldValue);

    return new FieldInput(field.type, field.key, cleanedValue);
  });
};
export const form_fields_to_data = (
  send_fields: FormField[],
): Record<string, FieldValue> => {
  return Object.fromEntries(
    send_fields.map((f) => {
      let value = f.value;

      if (f.type === FormType.ImagesEditor && Array.isArray(value)) {
        const images = value
          .map((img) => ({
            url: (img.url ?? "").trim(),
            altText: (img.altText ?? "").trim(),
          }))
          .filter((img) => img.url !== "" || img.altText !== "");

        if (images.length === 0) throw "form.error.required.images";

        const hasInvalid = images.some(
          (img) => img.url === "" || img.altText === "",
        );
        if (hasInvalid) throw "form.error.required.imageFields";

        return [f.key, images];
      }

      if (typeof value === "string") {
        value = value.trim();
        if (value === "") return [f.key, null];
      }

      if (f.type === "number" && typeof value === "string") {
        const num = Number(value);
        return [f.key, isNaN(num) ? null : num];
      }

      return [f.key, value];
    }),
  ) as unknown as Record<string, FieldValue>;
};

export const transform_data_to_body = (
  model: ModelType,
  data: Record<string, FieldValue>,
  categoryTitleToIdMap: Record<string, number>,
): Record<string, FieldValue> => {
  if (model === ModelType.product) {
    if (!data.category) {
      throw "form.error.required.category_id";
    }

    data.category_id = categoryTitleToIdMap[data.category as string]!;
    delete data.category;
  }

  return data;
};

//--formik ----

export type CheckoutFormValues = {
  name: string;
  email: string;
  phone: string;
  agreed: boolean;
};
export const checkout_fields = [
  { name: "name", type: "text" },
  { name: "email", type: "text" },
  { name: "phone", type: "tel" },
];

export const getCheckoutValidationSchema = (intl: IntlShape) =>
  Yup.object().shape({
    name: Yup.string()
      .min(2)
      .max(255)
      .required(intl.formatMessage({ id: "form.error.name" })),
    email: Yup.string()
      .email(intl.formatMessage({ id: "form.error.email" }))
      .max(255)
      .required(intl.formatMessage({ id: "form.error.email" })),
    phone: Yup.string()
      .when([], {
        is: () => localeCache.isRtl(),
        then: (schema) =>
          schema.matches(
            /^05\d{8}$/,
            intl.formatMessage({ id: "form.error.phone" }),
          ),
        otherwise: (schema) =>
          schema.matches(
            /^\+?[0-9\s\-().]{7,20}$/,
            intl.formatMessage({ id: "form.error.phone" }),
          ),
      })
      .required(intl.formatMessage({ id: "form.error.phone" })),
    agreed: Yup.boolean()
      .oneOf([true], intl.formatMessage({ id: "form.error.agree" }))
      .required(),
  });
