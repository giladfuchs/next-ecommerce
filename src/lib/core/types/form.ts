import { Review, Order } from "@/lib/core/types/payload-types";

/* =========================
   CHECKOUT
========================= */

export type CheckoutFormData = Pick<Order, "name" | "email" | "phone">;

type CheckoutFieldKey = keyof CheckoutFormData;

type CheckoutFieldConfig = {
  key: CheckoutFieldKey;
  inputProps: { type: string; autoComplete?: string };
  required?: boolean;
  pattern?: RegExp;
};

const phonePattern = /^\+?[0-9]{7,15}$/;
const emailPattern = /^\S+@\S+\.\S+$/;

export const checkoutFields: readonly CheckoutFieldConfig[] = [
  {
    key: "name",
    inputProps: { type: "text", autoComplete: "name" },
    required: true,
  },
  {
    key: "phone",
    inputProps: { type: "tel", autoComplete: "tel" },
    required: true,
    pattern: phonePattern,
  },
  {
    key: "email",
    inputProps: { type: "email", autoComplete: "email" },
    required: true,
    pattern: emailPattern,
  },
] as const;

export type CheckoutFormProps = {
  cartId: number | undefined;
  clearCart: undefined | (() => Promise<void> | void);
  onSuccess: (orderId: string) => void;
};

/* =========================
   REVIEW
========================= */

export type ReviewFormData = Pick<
  Review,
  "authorName" | "authorEmail" | "title" | "body" | "rating"
>;

type ReviewFieldKey = Exclude<keyof ReviewFormData, "body" | "rating">;

type ReviewFieldConfig = {
  key: ReviewFieldKey;
  inputProps: { type: string; autoComplete?: string };
  required?: boolean;
  pattern?: RegExp;
  patternMessageKey?: string;
  minLength?: number;
  maxLength?: number;
  gridClassName?: string;
};

export const reviewFields: readonly ReviewFieldConfig[] = [
  {
    key: "authorName",
    inputProps: { type: "text", autoComplete: "name" },
    required: true,
    minLength: 2,
    maxLength: 15,
  },
  {
    key: "authorEmail",
    inputProps: { type: "email", autoComplete: "email" },
    required: false,
    pattern: emailPattern,
    patternMessageKey: "fields.authorEmail.invalid",
    maxLength: 30,
  },
  {
    key: "title",
    inputProps: { type: "text", autoComplete: "off" },
    required: true,
    minLength: 5,
    maxLength: 40,
    gridClassName: "sm:col-span-2",
  },
] as const;
