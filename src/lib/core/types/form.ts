import type { Order, Review } from "@/lib/core/types/payload-types";
import type { ComponentProps } from "react";
import type { DefaultValues, FieldValues, Path } from "react-hook-form";

type FormButtonVariant =
  "default" | "outline" | "secondary" | "ghost" | "nav" | "select";

type FormValidation = {
  requiredKey?: string;
  pattern?: {
    value: RegExp;
    messageKey: string;
  };
  minLength?: {
    value: number;
    messageKey: string;
  };
  maxLength?: {
    value: number;
    messageKey: string;
  };
};

type FormFieldBase<T extends FieldValues> = {
  name: Path<T>;
  labelKey: string;
  className?: string;
  validation?: FormValidation;
};

type FormInputField<T extends FieldValues> = FormFieldBase<T> & {
  kind?: "input";
  inputProps?: Omit<ComponentProps<"input">, "name">;
};

type FormTextareaField<T extends FieldValues> = FormFieldBase<T> & {
  kind: "textarea";
  textareaProps?: Omit<ComponentProps<"textarea">, "name">;
};

type FormRatingField<T extends FieldValues> = FormFieldBase<T> & {
  kind: "rating";
  max: number;
  ariaLabelKey: string;
};

export type FormFieldConfig<T extends FieldValues> =
  FormInputField<T> | FormTextareaField<T> | FormRatingField<T>;

export type FormConfig<T extends FieldValues> = {
  translationNamespace: "checkout" | "review_form";
  fields: readonly FormFieldConfig<T>[];
  defaultValues: DefaultValues<T>;
  successMessageKey?: string;
  fallbackErrorMessageKey: string;
  className?: string;
  fieldsClassName?: string;
  actionsClassName?: string;
  errorClassName?: string;
  cancel?: {
    labelKey: string;
    variant?: FormButtonVariant;
  };
  submit: {
    labelKey: string;
    submittingLabelKey: string;
    eventName?: string;
    variant?: FormButtonVariant;
  };
};

const phonePattern = /^\+?[0-9]{7,15}$/;
const emailPattern = /^\S+@\S+\.\S+$/;

export type CheckoutFormData = Pick<Order, "name" | "email" | "phone">;

export const checkoutFormConfig: FormConfig<CheckoutFormData> = {
  translationNamespace: "checkout",
  defaultValues: {
    name: "",
    phone: "",
    email: "",
  },
  fields: [
    {
      name: "name",
      labelKey: "fields.name.label",
      inputProps: { type: "text", autoComplete: "name" },
      validation: { requiredKey: "fields.name.required" },
    },
    {
      name: "phone",
      labelKey: "fields.phone.label",
      inputProps: { type: "tel", autoComplete: "tel" },
      validation: {
        requiredKey: "fields.phone.required",
        pattern: {
          value: phonePattern,
          messageKey: "fields.phone.invalid",
        },
      },
    },
    {
      name: "email",
      labelKey: "fields.email.label",
      inputProps: { type: "email", autoComplete: "email" },
      validation: {
        requiredKey: "fields.email.required",
        pattern: {
          value: emailPattern,
          messageKey: "fields.email.invalid",
        },
      },
    },
  ],
  successMessageKey: "submit.success",
  fallbackErrorMessageKey: "submit.failed",
  className:
    "mx-auto flex w-full max-w-md flex-col gap-4 rounded-lg border p-6",
  fieldsClassName: "flex flex-col gap-4",
  errorClassName: "mt-2",
  submit: {
    labelKey: "submit.sendOrder",
    submittingLabelKey: "submit.sending",
    eventName: "purchase",
    variant: "outline",
  },
};

export type CheckoutFormProps = {
  cartId: number | undefined;
  clearCart: undefined | (() => Promise<void> | void);
  onSuccess: (orderId: string) => void;
};

export type ReviewFormData = Pick<
  Review,
  "authorName" | "authorEmail" | "title" | "body" | "rating"
>;

const reviewInputClassName =
  "border-border bg-background text-foreground placeholder:text-foreground/50 focus-visible:ring-ring/30";

export const reviewFormConfig: FormConfig<ReviewFormData> = {
  translationNamespace: "review_form",
  defaultValues: {
    authorName: "",
    authorEmail: "",
    title: "",
    body: "",
    rating: 5,
  },
  fields: [
    {
      name: "authorName",
      labelKey: "fields.authorName.label",
      inputProps: {
        type: "text",
        autoComplete: "name",
        className: reviewInputClassName,
      },
      validation: {
        requiredKey: "fields.authorName.required",
        minLength: { value: 2, messageKey: "validation.too_short" },
        maxLength: { value: 15, messageKey: "validation.too_long" },
      },
    },
    {
      name: "authorEmail",
      labelKey: "fields.authorEmail.label",
      inputProps: {
        type: "email",
        autoComplete: "email",
        className: reviewInputClassName,
      },
      validation: {
        pattern: {
          value: emailPattern,
          messageKey: "fields.authorEmail.invalid",
        },
        maxLength: { value: 30, messageKey: "validation.too_long" },
      },
    },
    {
      name: "title",
      labelKey: "fields.title.label",
      className: "sm:col-span-2",
      inputProps: {
        type: "text",
        autoComplete: "off",
        className: reviewInputClassName,
      },
      validation: {
        requiredKey: "fields.title.required",
        minLength: { value: 5, messageKey: "validation.too_short" },
        maxLength: { value: 40, messageKey: "validation.too_long" },
      },
    },
    {
      name: "rating",
      kind: "rating",
      labelKey: "fields.rating.label",
      ariaLabelKey: "fields.rating.aria",
      className: "sm:col-span-2",
      max: 5,
    },
    {
      name: "body",
      kind: "textarea",
      labelKey: "fields.body.label",
      className: "sm:col-span-2",
      textareaProps: {
        className:
          "border-border bg-background text-foreground placeholder:text-foreground/50 focus:ring-ring/30 mt-2 min-h-[8rem] w-full rounded-md border px-3 py-2 text-sm outline-none focus:ring-2",
      },
      validation: {
        requiredKey: "fields.body.required",
        minLength: { value: 10, messageKey: "validation.too_short" },
        maxLength: { value: 1000, messageKey: "validation.too_long" },
      },
    },
  ],
  successMessageKey: "toast_success",
  fallbackErrorMessageKey: "toast_failed",
  className: "flex flex-col gap-4 p-6",
  fieldsClassName: "grid grid-cols-1 gap-4 sm:grid-cols-2",
  actionsClassName: "flex items-center justify-end gap-3 pt-2",
  errorClassName: "pt-2",
  cancel: {
    labelKey: "cancel_button",
    variant: "outline",
  },
  submit: {
    labelKey: "submit_button",
    submittingLabelKey: "submit_sending",
    eventName: "submit_review",
  },
};
