"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { useMemo } from "react";

import type { ProductPurchaseSectionData } from "@/lib/core/types/types";

import AddToCart from "@/components/cart/add-to-cart";
import { Price } from "@/components/shared/elements-ssr";
import { Button } from "@/components/ui";
import { cn, createUrl } from "@/lib/core/util";
import {
  findVariantForOption,
  getOptionSwatch,
  getSelectedOption,
  getSelectedPurchaseVariant,
  getVariantOptionState,
} from "@/lib/core/variants";

export default function ProductPurchaseSectionClient({
  product,
}: {
  product: ProductPurchaseSectionData;
}) {
  const hasVariants = product.variants.length > 0;

  return (
    <>
      {product.priceRange.max !== product.priceRange.min && (
        <div className="mb-4">
          <ProductPrice product={product} />
        </div>
      )}
      {hasVariants ? (
        <div className="border-b pb-5">
          <VariantSelector product={product} />
        </div>
      ) : null}

      <div className="flex items-center justify-center py-4">
        <StockIndicator product={product} />
      </div>

      <div className="flex items-center justify-center pb-2">
        <AddToCart product={product} />
      </div>
    </>
  );
}

export const ProductPrice = ({
  product,
}: {
  product: ProductPurchaseSectionData;
}) => {
  const searchParams = useSearchParams();
  const selectedVariant = getSelectedPurchaseVariant(
    product,
    searchParams.get("variant"),
  );
  const price = selectedVariant?.price ?? product.price;
  const originalPrice = selectedVariant?.originalPrice ?? product.originalPrice;
  const hasDiscount =
    typeof originalPrice === "number" && originalPrice > price;

  return (
    <span className="flex items-baseline gap-2.5">
      {hasDiscount ? (
        <Price
          amount={originalPrice}
          as="span"
          className="text-sm font-medium text-gray-400 line-through dark:text-neutral-500"
        />
      ) : null}
      <Price
        amount={price}
        as="span"
        className="text-xl font-bold tracking-tight text-gray-950 dark:text-neutral-50"
      />
    </span>
  );
};

const VariantSelector = ({
  product,
}: {
  product: ProductPurchaseSectionData;
}) => {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const t = useTranslations("product.addToCart");
  const selectedVariant = getSelectedPurchaseVariant(
    product,
    searchParams.get("variant"),
  );

  const selectOption = (typeIndex: number, optionID: string) => {
    const nextVariant = findVariantForOption(
      product,
      selectedVariant,
      typeIndex,
      optionID,
    );
    if (!nextVariant) return;

    const params = new URLSearchParams(searchParams.toString());
    params.set("variant", nextVariant.id);

    window.history.replaceState(null, "", createUrl(pathname, params));
  };

  return (
    <div className="flex flex-col gap-7">
      {product.variantTypes.map((type, typeIndex) => {
        const selectedOption = getSelectedOption(type, selectedVariant);
        const style = type.selectorStyle;

        return (
          <dl key={type.typeId}>
            {style !== "swatch" && (
              <div className="mb-1 flex items-baseline justify-between gap-3">
                <dt className="text-sm font-semibold text-gray-900 dark:text-neutral-50">
                  {type.typeLabel}
                </dt>
              </div>
            )}

            {style === "swatch" ? (
              <dd className="flex min-h-7 flex-wrap items-center gap-3">
                {type.options.map((option) => {
                  const isSelected = selectedVariant?.optionIds.includes(
                    option.id,
                  );
                  const optionState = getVariantOptionState(
                    product,
                    selectedVariant,
                    typeIndex,
                    option.id,
                  );
                  const isSoldOut = optionState === "soldOut";

                  if (optionState === "unavailable") return null;

                  return (
                    <button
                      key={option.id}
                      type="button"
                      title={`${option.label}${isSoldOut ? ` — ${t("soldOut")}` : ""}`}
                      aria-label={`${type.typeLabel}: ${option.label}${isSoldOut ? ` — ${t("soldOut")}` : ""}`}
                      aria-pressed={isSelected}
                      onClick={() => selectOption(typeIndex, option.id)}
                      className={cn(
                        "relative size-6 shrink-0 cursor-pointer rounded-full bg-white transition-all duration-200 ease-out hover:scale-110 dark:bg-neutral-900 dark:ring-offset-neutral-900",
                        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-900 focus-visible:ring-offset-2 dark:focus-visible:ring-neutral-50",
                        isSelected
                          ? "ring-1 ring-gray-950 ring-offset-2 dark:ring-neutral-50"
                          : "ring-1 ring-black/15 hover:ring-black/35 dark:ring-white/20 dark:hover:ring-white/40",
                        isSoldOut && "opacity-60",
                      )}
                    >
                      <span
                        aria-hidden="true"
                        className="absolute inset-0 overflow-hidden rounded-full"
                        style={{ background: getOptionSwatch(option) }}
                      >
                        {isSoldOut ? (
                          <>
                            <span
                              aria-hidden="true"
                              className="pointer-events-none absolute left-[-15%] top-1/2 h-px w-[130%] rotate-45 bg-black/70"
                            />
                            <span
                              aria-hidden="true"
                              className="pointer-events-none absolute left-[-15%] top-1/2 h-px w-[130%] -rotate-45 bg-black/70"
                            />
                          </>
                        ) : null}
                      </span>
                    </button>
                  );
                })}
              </dd>
            ) : style === "select" ? (
              <dd>
                <select
                  value={selectedOption?.id ?? ""}
                  onChange={(event) =>
                    selectOption(typeIndex, event.target.value)
                  }
                  className="h-11 w-full rounded-xl border border-gray-200 bg-white px-4 text-sm font-medium text-gray-900 outline-none transition-all duration-200 hover:border-gray-400 focus:border-gray-900 focus:ring-2 focus:ring-gray-900/10 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-50 dark:hover:border-neutral-500 dark:focus:border-neutral-300 dark:focus:ring-neutral-50/10"
                  aria-label={type.typeLabel}
                >
                  {type.options.map((option) => {
                    const optionState = getVariantOptionState(
                      product,
                      selectedVariant,
                      typeIndex,
                      option.id,
                    );

                    if (optionState === "unavailable") return null;

                    return (
                      <option key={option.id} value={option.id}>
                        {option.label}
                        {optionState === "soldOut" ? ` — ${t("soldOut")}` : ""}
                      </option>
                    );
                  })}
                </select>
              </dd>
            ) : (
              <dd className="flex flex-wrap gap-2.5">
                {type.options.map((option) => {
                  const isSelected = selectedVariant?.optionIds.includes(
                    option.id,
                  );
                  const optionState = getVariantOptionState(
                    product,
                    selectedVariant,
                    typeIndex,
                    option.id,
                  );
                  const isSoldOut = optionState === "soldOut";

                  if (optionState === "unavailable") return null;

                  return (
                    <Button
                      key={option.id}
                      variant="select"
                      size="clear"
                      selected={isSelected}
                      aria-pressed={isSelected}
                      aria-label={`${type.typeLabel}: ${option.label}${isSoldOut ? ` — ${t("soldOut")}` : ""}`}
                      className={cn(
                        "relative min-h-12 min-w-20 overflow-hidden rounded-lg px-5 py-2 text-sm font-semibold uppercase tracking-wide transition-all duration-200",
                        !isSelected && "hover:border-gray-400",
                        !isSelected &&
                          isSoldOut &&
                          "border-gray-200 bg-gray-50 text-gray-400 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-600",
                      )}
                      onClick={() => selectOption(typeIndex, option.id)}
                    >
                      <span className="relative z-10 flex flex-col items-center leading-tight">
                        <span>{option.label}</span>
                      </span>
                      {isSoldOut ? (
                        <span
                          aria-hidden="true"
                          className="pointer-events-none absolute left-[-10%] top-1/2 h-px w-[120%] -rotate-[18deg] bg-gray-300 dark:bg-neutral-600"
                        />
                      ) : null}
                    </Button>
                  );
                })}
              </dd>
            )}

            {selectedOption ? (
              <dd className="mt-2 text-xs font-medium tracking-wide text-gray-500 dark:text-neutral-400">
                {selectedOption.label}
              </dd>
            ) : null}
          </dl>
        );
      })}
    </div>
  );
};

const StockIndicator = ({
  product,
}: {
  product: ProductPurchaseSectionData;
}) => {
  const t = useTranslations("product.stock");
  const searchParams = useSearchParams();
  const selectedVariant = useMemo(
    () => getSelectedPurchaseVariant(product, searchParams.get("variant")),
    [product, searchParams],
  );

  const stockQuantity = selectedVariant
    ? selectedVariant.inventory
    : Number(product.inventory ?? 0);
  const stockMessage =
    stockQuantity > 0 && stockQuantity < 5
      ? t("onlyLeft", { count: stockQuantity })
      : null;
  if (!stockMessage) return null;

  return (
    <p className="font-mono text-sm font-medium text-gray-500 uppercase dark:text-neutral-400">
      {stockMessage}
    </p>
  );
};
