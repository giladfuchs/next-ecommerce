"use client";

import { useCart } from "@payloadcms/plugin-ecommerce/client/react";
import clsx from "clsx";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { type MouseEvent, useCallback, useMemo } from "react";
import { toast } from "sonner";

import type { ProductPurchaseSectionData } from "@/lib/core/types/types";

import { openCart } from "@/components/cart/cart-modal";
import Button from "@/components/ui/button";

export default function AddToCart({
  product,
}: {
  product: ProductPurchaseSectionData;
}) {
  const t = useTranslations("product.addToCart");
  const { addItem, cart, isLoading } = useCart();
  const searchParams = useSearchParams();

  const hasVariants = product.variants.length > 0;

  const selectedVariant = useMemo(() => {
    const variantId = searchParams.get("variant");
    if (!variantId) return null;

    for (const group of product.variants) {
      const hit = group.options.find((o) => o.id === String(variantId));
      if (hit) return hit;
    }

    return null;
  }, [product.variants, searchParams]);

  const disabled = useMemo(() => {
    if (isLoading) return true;

    if (hasVariants) return !selectedVariant || selectedVariant.inventory <= 0;

    const stock = Number(product.inventory ?? 0);
    if (stock <= 0) return true;

    const existingQty =
      cart?.items?.find((item) => {
        const productID =
          typeof item.product === "object" ? item.product?.id : item.product;
        return productID === product.id && !item.variant;
      })?.quantity ?? 0;

    return Number(existingQty) >= stock;
  }, [
    cart?.items,
    hasVariants,
    isLoading,
    product.id,
    product.inventory,
    selectedVariant,
  ]);

  const addToCart = useCallback(
    (e: MouseEvent<HTMLButtonElement>) => {
      e.preventDefault();

      if (hasVariants && !selectedVariant) {
        toast.error(t("selectVariant"));
        return;
      }

      addItem({
        product: product.id,
        variant: selectedVariant ? Number(selectedVariant.id) : undefined,
      }).then(() => {
        toast.success(t("added"));
        openCart();
      });
    },
    [addItem, hasVariants, product.id, selectedVariant, t],
  );

  return (
    <Button
      aria-label={t("button")}
      className={clsx({ "hover:opacity-90": true })}
      disabled={disabled}
      onClick={addToCart}
      type="submit"
      eventName="add_to_cart"
    >
      {t("button")}
    </Button>
  );
}
