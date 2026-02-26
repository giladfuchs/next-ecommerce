import { getTranslations } from "next-intl/server";

import type { Product } from "@/lib/core/types/payload-types";

import { Categories } from "@/components/category/categories";
import { ProductGridItem } from "@/components/product/grid/product-grid-item";
import { Grid } from "@/components/shared/elements-ssr";

export default async function ProductsGrid({
  products,
  currentSlug,
}: {
  products: Product[];
  currentSlug: string;
}) {
  const t = await getTranslations("product");

  return (
    <div className="container flex flex-col gap-2 my-5 pb-4">
      <div className="flex flex-col md:flex-row items-start justify-between gap-16 md:gap-4">
        <div className="w-full md:max-w-[10rem] flex-none flex flex-col gap-4 md:gap-8 basis-1/5">
          <Categories currentSlug={currentSlug} />
        </div>
        <div className="min-h-screen w-full">
          {products.length > 0 ? (
            <Grid className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((product) => (
                <ProductGridItem key={product.id} product={product} />
              ))}
            </Grid>
          ) : (
            <p className="mb-4">{t("not_found")}</p>
          )}
        </div>
      </div>
    </div>
  );
}
