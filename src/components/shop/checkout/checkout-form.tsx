"use client";

import { useCallback } from "react";

import GenericForm from "@/components/shared/generic-form";
import {
  checkoutFormConfig,
  type CheckoutFormData,
  type CheckoutFormProps,
} from "@/lib/core/types/form";
import { postJson } from "@/lib/core/util";
import CheckoutPayment from "@/lib/stripe/CheckoutPayment";
import { stripeConfig } from "@/lib/stripe/config";

export default function CheckoutForm({
  cartId,
  clearCart,
  onSuccess,
}: CheckoutFormProps) {
  const submitOrder = useCallback(
    async (data: CheckoutFormData) => {
      const json = await postJson<{ doc: { id: number } }>("orders?depth=0", {
        cart: cartId,
        ...data,
      });

      return String(json.doc.id);
    },
    [cartId],
  );

  if (stripeConfig.ENABLED) {
    return (
      <CheckoutPayment
        cartId={cartId}
        clearCart={clearCart}
        onSuccess={onSuccess}
      />
    );
  }

  return (
    <GenericForm
      config={checkoutFormConfig}
      onSubmit={submitOrder}
      onSuccess={async (orderId) => {
        onSuccess(orderId);
        await clearCart?.();
      }}
      disabled={!cartId}
    />
  );
}
