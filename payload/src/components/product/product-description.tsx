import type { ProductSinglePage } from "@/lib/core/types/types";

import { Price } from "@/components/shared/elements-ssr";
import { Faq } from "@/components/shared/faq";
import { ProductPurchaseSection } from "@/components/shared/wrappers";
import { RichText } from "@/components/ui/rich-text";

export function ProductDescription({
  product,
}: {
  product: ProductSinglePage;
}) {
  const isLongTitle = (product.title || "").length > 30;

  return (
    <div className="flex flex-col gap-6">
      <div className="border-b pb-6">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
          <h1
            className={[
              "font-bold leading-tight",
              isLongTitle ? "text-3xl" : "text-4xl",
              "break-words",
            ].join(" ")}
          >
            {product.title}
          </h1>

          <div className="flex lg:justify-end">
            <div className="rounded-full bg-[#AAF2E7] px-4 py-1 text-2xl font-bold text-black whitespace-nowrap">
              {product.purchase_section.variants.length > 0 ? (
                <Price
                  highestAmount={product.purchase_section.priceRange.max}
                  lowestAmount={product.purchase_section.priceRange.min}
                />
              ) : (
                <Price amount={product.purchase_section.price} />
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="pt-6">
        <div className="min-h-[12rem]">
          <ProductPurchaseSection product={product.purchase_section} />
        </div>

        {product.description ? (
          <div className="border-t pt-1 text-[1.125rem] leading-relaxed">
            <RichText
              data={product.description}
              enableGutter={false}
              enableProse={false}
            />
          </div>
        ) : null}
      </div>

      <Faq faqs={product.faqs} />
    </div>
  );
}
