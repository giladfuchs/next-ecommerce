"use client";

import { useCart } from "@payloadcms/plugin-ecommerce/client/react";
import { useTranslations } from "next-intl";

import type { Product, Variant, VariantOption } from "@/payload-types";

import { Price } from "@/components/shared/elements-ssr";
import ImageVideo from "@/components/shared/image-video";
import { getProductPricing } from "@/lib/core/adapter";

export default function CheckoutSummary() {
  const { cart } = useCart();
  const t = useTranslations("checkout.page");

  return (
    <div className="w-full p-2 lg:p-8  flex flex-col gap-6 rounded-lg max-w-lg mx-auto">
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

        const { price, originalPrice, discountPercent } = getProductPricing(
          product,
          variant,
        );

        const variantLabels =
          variant?.options
            ?.map((o) =>
              typeof o === "object" ? (o as VariantOption).label : null,
            )
            .filter((v): v is string => Boolean(v))
            .join(", ") ?? "";

        return (
          <div className="flex items-start gap-4" key={index}>
            <div className="relative h-20 w-22 shrink-0">
              <div className="relative flex h-full w-full rounded-lg border overflow-hidden">
                {typeof product.meta?.image === "object" && (
                  <ImageVideo
                    fill
                    imgClassName="rounded-lg object-cover"
                    resource={product.meta.image}
                    variant="card"
                  />
                )}
              </div>
              {discountPercent !== null ? (
                <span className="absolute -end-2 -top-2 rounded-full bg-gray-600 px-1.5 py-0.5 text-[10px] font-semibold text-white shadow">
                  {discountPercent}%
                </span>
              ) : null}
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

              {typeof price === "number" ? (
                <div className="flex shrink-0 flex-col items-end gap-0.5 text-sm">
                  {originalPrice !== undefined ? (
                    <Price
                      amount={originalPrice}
                      as="span"
                      className="text-gray-400 line-through dark:text-gray-500"
                    />
                  ) : null}
                  <Price
                    amount={price}
                    as="span"
                    className={
                      originalPrice !== undefined
                        ? "font-semibold text-red-600 dark:text-red-400"
                        : "font-semibold"
                    }
                  />
                </div>
              ) : null}
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
