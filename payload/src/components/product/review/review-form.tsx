"use client";

import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useCallback, useState } from "react";
import { useForm } from "react-hook-form";
import { FaStar } from "react-icons/fa";
import { toast } from "sonner";

import type { Review } from "@/lib/core/types/payload-types";

import { Message } from "@/components/shared/message";
import Button from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { reviewFields, type ReviewFormData } from "@/lib/core/types/form";
import { postJson } from "@/lib/core/util";

export default function ReviewFormClient({ productId }: { productId: number }) {
  const router = useRouter();
  const t = useTranslations("review_form");

  const [isOpen, setIsOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    formState: { errors, isValid },
    handleSubmit,
    register,
    reset,
    watch,
    setValue,
  } = useForm<ReviewFormData>({
    mode: "onChange",
    defaultValues: {
      authorName: "",
      authorEmail: "",
      title: "",
      body: "",
      rating: 5,
    },
  });

  const rating = watch("rating");

  const close = useCallback(() => {
    setIsOpen(false);
    setError(null);
    reset();
  }, [reset]);

  const submitReview = useCallback(
    async (data: ReviewFormData) => {
      setError(null);
      setIsSubmitting(true);

      try {
        await postJson<Review>("reviews?depth=0", {
          ...data,
          product: productId,
        });

        toast.success(t("toast_success"));
        close();
        setTimeout(() => {
          router.refresh();
        }, 500);
      } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : t("toast_failed");
        setError(msg);
        toast.error(msg);
      } finally {
        setIsSubmitting(false);
      }
    },
    [close, productId, router, t],
  );

  return (
    <>
      <div className="flex justify-center">
        <Button
          eventName="open_review_dialog"
          variant="outline"
          type="button"
          onClick={() => setIsOpen(true)}
        >
          {t("open_button")}
        </Button>
      </div>

      {isOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <button
            type="button"
            className="absolute inset-0 bg-black/60"
            aria-label={t("close_aria")}
            onClick={close}
          />

          <div className="relative w-full max-w-2xl rounded-2xl border border-black/10 bg-white text-black shadow-2xl [color-scheme:light] max-h-[calc(100dvh-2rem)] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-black/10">
              <div>
                <div className="text-lg font-semibold">{t("title")}</div>
                <div className="text-sm text-black/60">{t("subtitle")}</div>
              </div>

              <Button
                variant="secondary"
                className="rounded-md px-3 py-2 text-sm hover:bg-black/5"
                onClick={close}
                aria-label={t("close_aria")}
              >
                {t("close_button")}
              </Button>
            </div>

            <form
              className="p-6 flex flex-col gap-4"
              onSubmit={handleSubmit(submitReview)}
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {reviewFields.map((field) => (
                  <div key={field.key} className={field.gridClassName ?? ""}>
                    <Label htmlFor={field.key}>
                      {t(`fields.${field.key}.label`)}
                    </Label>

                    <Input
                      id={field.key}
                      {...field.inputProps}
                      {...register(field.key, {
                        ...(field.required
                          ? { required: t(`fields.${field.key}.required`) }
                          : {}),
                        ...(field.pattern
                          ? {
                              pattern: {
                                value: field.pattern,
                                message: field.patternMessageKey
                                  ? t(field.patternMessageKey)
                                  : t(`fields.${field.key}.invalid`),
                              },
                            }
                          : {}),
                        ...(typeof field.minLength === "number"
                          ? {
                              minLength: {
                                value: field.minLength,
                                message: t("validation.too_short", {
                                  field: t(`fields.${field.key}.label`),
                                  min: field.minLength,
                                }),
                              },
                            }
                          : {}),

                        ...(typeof field.maxLength === "number"
                          ? {
                              maxLength: {
                                value: field.maxLength,
                                message: t("validation.too_long", {
                                  field: t(`fields.${field.key}.label`),
                                  max: field.maxLength,
                                }),
                              },
                            }
                          : {}),
                      })}
                      aria-invalid={Boolean(errors[field.key])}
                      className="bg-white text-black placeholder:text-black/40 border-black/20 focus-visible:ring-black/20"
                    />

                    {errors[field.key]?.message ? (
                      <Message error={String(errors[field.key]?.message)} />
                    ) : null}
                  </div>
                ))}
              </div>

              <div>
                <Label htmlFor="rating">{t("fields.rating.label")}</Label>

                <div className="mt-2 flex items-center gap-3">
                  <div className="flex items-center gap-1">
                    {Array.from({ length: 5 }).map((_, i) => {
                      const value = i + 1;
                      const active = value <= Number(rating || 0);

                      return (
                        <button
                          key={value}
                          type="button"
                          aria-label={t("fields.rating.aria", { value })}
                          onClick={() =>
                            setValue("rating", value, {
                              shouldValidate: true,
                              shouldDirty: true,
                            })
                          }
                          className="transition"
                        >
                          <FaStar
                            className={`w-6 h-6 transition ${
                              active
                                ? "text-yellow-500"
                                : "text-black/30 hover:text-black/60"
                            }`}
                          />
                        </button>
                      );
                    })}
                  </div>

                  <div className="text-sm text-black/60">{rating}/5</div>
                </div>
              </div>

              <div>
                <Label htmlFor="body">{t("fields.body.label")}</Label>
                <textarea
                  id="body"
                  className="mt-2 w-full rounded-md border border-black/20 bg-white text-black placeholder:text-black/40 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-black/20 min-h-[8rem]"
                  {...register("body", {
                    required: t("fields.body.required"),
                    minLength: {
                      value: 10,
                      message: t("validation.too_short", {
                        field: t("fields.body.label"),
                        min: 10,
                      }),
                    },
                    maxLength: {
                      value: 1000,
                      message: t("validation.too_long", {
                        field: t("fields.body.label"),
                        max: 1000,
                      }),
                    },
                  })}
                  aria-invalid={Boolean(errors.body)}
                />
                {errors.body?.message ? (
                  <Message error={String(errors.body?.message)} />
                ) : null}
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <Button
                  variant="outline"
                  onClick={close}
                  disabled={isSubmitting}
                >
                  {t("cancel_button")}
                </Button>

                <Button
                  eventName="submit_review"
                  type="submit"
                  disabled={!isValid || isSubmitting || !productId}
                >
                  {isSubmitting ? t("submit_sending") : t("submit_button")}
                </Button>
              </div>

              {error ? (
                <div className="pt-2">
                  <Message error={error} />
                </div>
              ) : null}
            </form>
          </div>
        </div>
      ) : null}
    </>
  );
}
