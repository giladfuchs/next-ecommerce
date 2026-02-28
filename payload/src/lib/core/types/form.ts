import { Review } from "@/lib/core/types/payload-types";

export const checkoutFields = [
  { key: "name", inputProps: { type: "text", autoComplete: "name" } },
  {
    key: "phone",
    pattern: /^\+?[0-9]{7,15}$/,
    inputProps: { type: "tel", autoComplete: "tel" },
  },
  {
    key: "email",
    pattern: /^\S+@\S+\.\S+$/,
    inputProps: { type: "email", autoComplete: "email" },
  },
] as const;

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

const emailPattern = /^\S+@\S+\.\S+$/;

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
    minLength: 2,
    maxLength: 40,
    gridClassName: "sm:col-span-2",
  },
] as const;
