import type { ProductSinglePage } from "@/lib/core/types/types";

import { ProductDescription } from "@/components/product/product-description";
import { BackButton, Gallery } from "@/components/shared/wrappers";

export default function ProductPageLayout({
  product,
}: {
  product: ProductSinglePage;
}) {
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
    </div>
  );
}
