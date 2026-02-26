"use client";

import { useCart } from "@payloadcms/plugin-ecommerce/client/react";
import { useTranslations } from "next-intl";

import type {
  Product,
  Variant,
  VariantOption,
  Media as MediaT,
} from "@/lib/core/types/payload-types";

import { Price } from "@/components/shared/elements-ssr";
import Media from "@/components/shared/media";

export default function CheckoutSummary() {
  const { cart } = useCart();
  const t = useTranslations("checkout.page");

  return (
    <div className="w-full p-8  flex flex-col gap-6 rounded-lg max-w-lg mx-auto">
      <h2 className="text-3xl font-medium">{t("yourCart")}</h2>

      {cart?.items?.map((item, index) => {
        if (typeof item.product !== "object" || !item.product) return null;

        const product: Product = item.product;
        const quantity = item.quantity;
        const variant =
          typeof item.variant === "object"
            ? (item.variant as Variant)
            : undefined;

        if (!quantity) return null;

        const image = product.gallery?.[0]?.image as MediaT;
        const price =
          variant?.priceInUSD != null ? variant.priceInUSD : product.priceInUSD;

        const variantLabels =
          variant?.options
            ?.map((o) =>
              typeof o === "object" ? (o as VariantOption).label : null,
            )
            .filter((v): v is string => Boolean(v))
            .join(", ") ?? "";

        return (
          <div className="flex items-start gap-4" key={index}>
            <div className="flex h-20 w-20 p-2 rounded-lg border">
              <div className="relative w-full h-full">
                <Media fill imgClassName="rounded-lg" resource={image} />
              </div>
            </div>

            <div className="flex grow justify-between items-center">
              <div className="flex flex-col gap-1">
                <p className="font-medium text-lg">{product.title}</p>

                {variantLabels ? (
                  <p className="text-sm font-mono  tracking-widest">
                    {variantLabels}
                  </p>
                ) : null}

                <div>x{quantity}</div>
              </div>

              {typeof price === "number" ? <Price amount={price} /> : null}
            </div>
          </div>
        );
      })}

      <hr />

      <div className="flex justify-between items-center gap-2">
        <span className="uppercase">{t("total")}</span>
        <Price className="text-3xl font-medium" amount={cart?.subtotal ?? 0} />
      </div>
    </div>
  );
}
