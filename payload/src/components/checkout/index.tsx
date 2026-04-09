"use client";

import { useCart } from "@payloadcms/plugin-ecommerce/client/react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { useMemo, useState } from "react";

import CheckoutForm from "@/components/checkout/checkout-form";
import CheckoutSummary from "@/components/checkout/checkout-summary";
import Button from "@/components/ui/button";

export default function CheckoutClient() {
  const t = useTranslations("checkout.page");
  const { cart, clearCart } = useCart();
  const [successOrderId, setSuccessOrderId] = useState<string | null>(null);

  const cartIsEmpty = !cart?.items?.length;

  const cartId = useMemo(() => {
    const id = cart?.id;
    return typeof id === "number" ? id : undefined;
  }, [cart]);

  if (cartIsEmpty && !successOrderId) {
    return (
      <div className="py-12 flex flex-col items-center text-center text-foreground">
        <p className="text-lg font-medium">{t("emptyCart")}</p>

        <Link
          href="/"
          className="mt-4  underline underline-offset-4 hover:opacity-80"
        >
          {t("continueShopping")}
        </Link>
      </div>
    );
  }

  return successOrderId ? (
    <div className="flex justify-center w-full my-8">
      <div className="rounded-lg p-6 w-full max-w-md text-center">
        <p className="font-medium">{t("orderReceived")}</p>
        <p className="text-sm opacity-80 mt-1">
          {t("orderId", { id: successOrderId })}
        </p>
        <Button className="mt-4" variant="outline">
          <Link href="/">{t("backToShop")}</Link>
        </Button>
      </div>
    </div>
  ) : (
    <div className="flex flex-col md:flex-row justify-center items-start w-full max-w-5xl mx-auto gap-6 my-8">
      <CheckoutForm
        cartId={cartId}
        clearCart={clearCart}
        onSuccess={(orderId) => setSuccessOrderId(orderId)}
      />

      <CheckoutSummary />
    </div>
  );
}
