"use client";

import { useCart } from "@payloadcms/plugin-ecommerce/client/react";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { type MouseEvent, useCallback, useMemo } from "react";
import { FiShare2 } from "react-icons/fi";
import { toast } from "sonner";

import type { ProductPurchaseSectionData } from "@/lib/core/types/types";

import { openCart } from "@/components/cart/cart-modal";
import { Button } from "@/components/ui";
import { cn } from "@/lib/core/util";
import { getSelectedPurchaseVariant } from "@/lib/core/variants";

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
    return getSelectedPurchaseVariant(product, searchParams.get("variant"));
  }, [product.variants, searchParams]);
  const needsVariantSelection = hasVariants && !selectedVariant;
  const isSoldOut = hasVariants
    ? Boolean(selectedVariant && selectedVariant.inventory <= 0)
    : Number(product.inventory ?? 0) <= 0;

  const disabled = useMemo(() => {
    if (isLoading) return true;

    if (hasVariants) {
      if (!selectedVariant || selectedVariant.inventory <= 0) return true;

      const existingQty =
        cart?.items?.find((item) => {
          const variantID =
            typeof item.variant === "object" ? item.variant?.id : item.variant;
          return String(variantID) === selectedVariant.id;
        })?.quantity ?? 0;

      return Number(existingQty) >= selectedVariant.inventory;
    }

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
  const handleShare = async () => {
    if (!navigator.share) {
      alert(t("shareNotSupported"));
      return;
    }

    try {
      await navigator.share({
        title: document.title,
        url: window.location.href,
      });
    } catch (err) {
      console.error("Share failed:", err);
    }
  };
  return (
    <div className="flex w-full items-stretch gap-3">
      <Button
        aria-label={
          isSoldOut
            ? t("soldOut")
            : needsVariantSelection
              ? t("chooseOptions")
              : t("button")
        }
        className={cn(
          "h-12 flex-1 rounded-lg text-sm font-semibold tracking-[0.08em] uppercase transition-all duration-200 hover:opacity-90 active:scale-[0.98] disabled:opacity-100 disabled:active:scale-100",
          (isSoldOut || needsVariantSelection) &&
            "!bg-gray-200 !text-gray-400 dark:!bg-neutral-800 dark:!text-neutral-500",
        )}
        disabled={disabled}
        onClick={addToCart}
        type="submit"
        eventName="add_to_cart"
      >
        {isSoldOut
          ? t("soldOut")
          : needsVariantSelection
            ? t("chooseOptions")
            : t("button")}
      </Button>

      <Button
        onClick={handleShare}
        aria-label={t("share")}
        variant="outline"
        className="inline-flex size-12 shrink-0 items-center justify-center rounded-lg p-0 transition-all duration-200 hover:opacity-90 active:scale-[0.98]"
      >
        <FiShare2 size={22} />
      </Button>
    </div>
  );
}
