"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { useMemo } from "react";

import type { ProductPurchaseSectionData } from "@/lib/core/types/types";

import AddToCart from "@/components/cart/add-to-cart";
import { Price } from "@/components/shared/elements-ssr";
import Button from "@/components/ui/button";
import { createUrl } from "@/lib/core/util";

export default function ProductPurchaseSectionClient({
  product,
}: {
  product: ProductPurchaseSectionData;
}) {
  const hasVariants = product.variants.length > 0;

  return (
    <>
      {hasVariants ? (
        <div className="flex flex-col gap-6">
          <VariantSelector product={product} />
          <div className="border-t" />
        </div>
      ) : null}

      <div className="flex items-center justify-between py-4">
        <StockIndicator product={product} />
      </div>

      <div className="flex items-center justify-center pb-2">
        <AddToCart product={product} />
      </div>
    </>
  );
}
const VariantSelector = ({
  product,
}: {
  product: ProductPurchaseSectionData;
}) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  return (
    <>
      {product.variants.map((type) => (
        <dl key={type.typeId}>
          <dt className="mb-4 text-md">{type.typeLabel}</dt>

          <dd className="flex flex-wrap gap-3">
            {type.options.map((option) => (
              <Button
                key={option.id}
                variant="select"
                selected={searchParams.get("variant") === option.id}
                disabled={option.inventory <= 0}
                className="px-4 py-7 flex flex-col items-center justify-center gap-1 transition-all"
                onClick={() => {
                  const params = new URLSearchParams(searchParams.toString());
                  params.set("variant", option.id);
                  router.replace(createUrl(pathname, params), {
                    scroll: false,
                  });
                }}
              >
                <p className="text-sm font-medium">{option.label}</p>

                <Price amount={option.price} />
              </Button>
            ))}
          </dd>
        </dl>
      ))}
    </>
  );
};

const StockIndicator = ({
  product,
}: {
  product: ProductPurchaseSectionData;
}) => {
  const t = useTranslations("product.stock");
  const searchParams = useSearchParams();

  const selectedVariant = useMemo(() => {
    const variantId = searchParams.get("variant");
    if (!variantId) return null;

    for (const group of product.variants) {
      const hit = group.options.find((o) => o.id === String(variantId));
      if (hit) return hit;
    }

    return null;
  }, [product.variants, searchParams]);

  const hasVariants = product.variants.length > 0;
  if (hasVariants && !selectedVariant) return null;

  const stockQuantity = hasVariants
    ? selectedVariant!.inventory
    : Number(product.inventory ?? 0);

  const stockMessage =
    stockQuantity > 0 && stockQuantity < 10
      ? t("onlyLeft", { count: stockQuantity })
      : stockQuantity > 0
        ? t("inStock")
        : t("outOfStock");

  return (
    <div className="uppercase font-mono text-sm font-medium text-gray-500">
      <p>{stockMessage}</p>
    </div>
  );
};
