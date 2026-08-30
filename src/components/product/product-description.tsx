import type { ProductSinglePage } from "@/lib/core/types/types";

import { Price } from "@/components/shared/elements-ssr";
import { ProductPurchaseSection } from "@/components/shared/wrappers";
import { Faq, RichText } from "@/components/ui";
import { isRtl } from "@/lib/core/util";

export default function ProductDescription({
  product,
}: {
  product: ProductSinglePage;
}) {
  const isLongTitle = (product.title || "").length > 30;
  // console.log( JSON.stringify(product.description, null, 2))
  const rtl = isRtl(product.title);

  return (
    <div className="flex flex-col gap-6">
      <div className="border-b pb-6">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
          <h1
            dir={rtl ? "rtl" : "ltr"}
            className={[
              "font-bold leading-tight break-words",
              isLongTitle ? "text-3xl" : "text-4xl",
              rtl ? "text-right" : "text-left",
            ].join(" ")}
          >
            {product.title}
          </h1>

          <div className="flex lg:justify-end">
            <div className="rounded-full bg-[#9F1239] px-4 py-1 text-2xl font-bold text-white whitespace-nowrap">
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

      <div
        className={
          product.purchase_section.variants.length
            ? "min-h-[12rem]"
            : "min-h-[3rem]"
        }
      >
        <ProductPurchaseSection product={product.purchase_section} />
      </div>

      <div className="border-t pt-1 text-[1.125rem] leading-relaxed">
        <RichText
          data={product.description}
          enableGutter={false}
          enableProse={false}
        />
      </div>

      <Faq faqs={product.faqs} title={product.title} />
    </div>
  );
}
