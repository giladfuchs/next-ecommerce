import { FormType, ModelType } from "./enums";
import { Image } from "./entities";

export class FieldInput {
  constructor(
    public type: FormType,
    public key: string,
    public value: string | boolean = "",
  ) {}
}

export class FieldAutoComplete {
  readonly type: FormType = FormType.AutoComplete;
  public value: string;

  constructor(
    public key: string,
    public options: string[],
    value?: string,
  ) {
    this.value = value ?? options[0] ?? "";
  }
}

export class FieldImages {
  readonly type: FormType = FormType.ImagesEditor;

  constructor(
    public key: string,
    public value: Image[] = [],
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

export const get_form_by_model = (type_form: ModelType): FormField[] => {
  switch (type_form) {
    case ModelType.product:
      return [...product_fields];
    case ModelType.category:
    default:
      return [...category_fields];
  }
};

export const array_obj_to_obj_with_key = (
  iterable: any[],
  value: any,
  key: string,
) => iterable.find((o: any) => o[key]?.toString() === value.toString());

export const create_form_fields = (
  source: FormField[],
  target: any,
): FormField[] => {
  if (
    target == null ||
    (Array.isArray(target) && target.length === 0) ||
    (typeof target === "object" && Object.keys(target).length === 0)
  ) {
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
    const updatedValue = target[field.key];

    if (field instanceof FieldImages && Array.isArray(updatedValue)) {
      return new FieldImages(field.key, updatedValue);
    }

    if (field instanceof FieldAutoComplete) {
      return new FieldAutoComplete(field.key, field.options, updatedValue);
    }

    return new FieldInput(
      field.type,
      field.key,
      typeof updatedValue === "string" ? updatedValue.trim() : updatedValue,
    );
  });
};
