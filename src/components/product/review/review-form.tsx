"use client";

import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useCallback, useState } from "react";

import type { Review } from "@/lib/core/types/payload-types";

import GenericForm from "@/components/shared/generic-form";
import { Button } from "@/components/ui";
import { reviewFormConfig, type ReviewFormData } from "@/lib/core/types/form";
import { postJson } from "@/lib/core/util";

export default function ReviewFormClient({ productId }: { productId: number }) {
  const router = useRouter();
  const t = useTranslations("review_form");

  const [isOpen, setIsOpen] = useState(false);

  const close = useCallback(() => {
    setIsOpen(false);
  }, []);

  const submitReview = useCallback(
    async (data: ReviewFormData) => {
      await postJson<Review>("reviews?depth=0", {
        ...data,
        product: productId,
      });
    },
    [productId],
  );

  return (
    <>
      <div className="flex justify-center">
        <Button
          eventName="open_review_dialog"
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

          <div className="relative w-full max-w-2xl rounded-2xl border border-border bg-background text-foreground shadow-2xl max-h-[calc(100dvh-2rem)] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-border">
              <div>
                <div className="text-lg font-semibold">{t("title")}</div>
                <div className="text-sm text-foreground/70">
                  {t("subtitle")}
                </div>
              </div>

              <Button
                variant="secondary"
                onClick={close}
                aria-label={t("close_aria")}
              >
                {t("close_button")}
              </Button>
            </div>

            <GenericForm
              config={reviewFormConfig}
              onSubmit={submitReview}
              onSuccess={() => {
                close();
                setTimeout(() => router.refresh(), 500);
              }}
              onCancel={close}
              disabled={!productId}
            />
          </div>
        </div>
      ) : null}
    </>
  );
}
