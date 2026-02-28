"use client";

import { useTranslations } from "next-intl";
import { useCallback, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { Message } from "@/components/shared/message";
import Button from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { checkoutFields } from "@/lib/core/types/form";
import { CheckoutFormData, CheckoutFormProps } from "@/lib/core/types/types";
import { postJson } from "@/lib/core/util";

export default function CheckoutForm({
  cartId,
  clearCart,
  onSuccess,
}: CheckoutFormProps) {
  const tFields = useTranslations("checkout.fields");
  const tSubmit = useTranslations("checkout.submit");

  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    formState: { errors, isValid },
    handleSubmit,
    register,
  } = useForm<CheckoutFormData>({
    mode: "onChange",
    defaultValues: Object.fromEntries(
      checkoutFields.map((field) => [field.key, ""]),
    ) as CheckoutFormData,
  });

  const submitOrder = useCallback(
    async (data: CheckoutFormData) => {
      setError(null);
      setIsSubmitting(true);

      try {
        const json = await postJson<{
          doc: { id: number };
        }>("orders?depth=0", {
          cart: cartId,
          ...data,
        });

        onSuccess(String(json.doc.id));
        toast.success(tSubmit("success"));

        if (typeof clearCart === "function") {
          await clearCart();
        }
      } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : tSubmit("failed");
        setError(msg);
        toast.error(msg);
      } finally {
        setIsSubmitting(false);
      }
    },
    [cartId, clearCart, onSuccess, tSubmit],
  );

  return (
    <form
      className="border rounded-lg p-6 flex flex-col gap-4 w-full max-w-md mx-auto"
      onSubmit={handleSubmit(submitOrder)}
    >
      {checkoutFields.map((field) => (
        <div key={field.key}>
          <Label htmlFor={field.key}>{tFields(`${field.key}.label`)}</Label>

          <Input
            id={field.key}
            {...field.inputProps}
            {...register(field.key, {
              required: tFields(`${field.key}.required`),
              ...(field.key === "phone" && field.pattern
                ? {
                    pattern: {
                      value: field.pattern,
                      message: tFields(`${field.key}.invalid`),
                    },
                  }
                : {}),
            })}
            aria-invalid={Boolean(errors[field.key])}
          />

          {errors[field.key]?.message && (
            <Message error={String(errors[field.key]?.message)} />
          )}
        </div>
      ))}

      <Button
        eventName="purchase"
        variant="outline"
        type="submit"
        disabled={!isValid || isSubmitting || !cartId}
      >
        {isSubmitting ? tSubmit("sending") : tSubmit("sendOrder")}
      </Button>

      {error ? (
        <div className="mt-2">
          <Message error={error} />
        </div>
      ) : null}
    </form>
  );
}
