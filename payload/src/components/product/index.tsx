import { getTranslations } from "next-intl/server";

import type { ProductSinglePage } from "@/lib/core/types/types";

import { ProductGridItem } from "@/components/product/grid/product-grid-item";
import { ProductDescription } from "@/components/product/product-description";
import {
  AutoScrollRow,
  BackButton,
  Gallery,
} from "@/components/shared/wrappers";

export default async function ProductPageLayout({
  product,
}: {
  product: ProductSinglePage;
}) {
  const t = await getTranslations("product");

  return (
    <div className="container pb-2 ">
      <BackButton />

      <div className="flex flex-col gap-12 rounded-lg border  border-t-0 p-8    lg:flex-row lg:gap-8  ">
        <div className="basis-full lg:basis-1/2">
          <ProductDescription product={product} />
        </div>
        <div className="h-full w-full basis-full lg:basis-1/2">
          <div className="min-h-[32rem] w-full">
            <Gallery gallery={product.gallery || []} />
          </div>
        </div>
      </div>
      {product.relatedProducts?.length ? (
        <div className="pt-8">
          <h3 className="mb-4 text-lg font-semibold">{t("relatedProducts")}</h3>
          <AutoScrollRow className="snap-x snap-proximity">
            {product.relatedProducts.map((p) => (
              <div
                key={p.id}
                className="min-w-[75%] sm:min-w-[50%] md:min-w-[33%] lg:min-w-[25%] snap-start"
              >
                <ProductGridItem product={p} />
              </div>
            ))}
          </AutoScrollRow>
        </div>
      ) : null}
    </div>
  );
}
