import type { Product } from "@/lib/core/types/payload-types";

import ProductsGrid from "@/components/product/grid";
import { RichText } from "@/components/ui/rich-text";

type Props = {
  title: string;
  description: Product["description"];
  products: Product[];
  slug: string;
};

export default async function CategoryPageLayout({
  title,
  description,
  products,
  slug,
}: Props) {
  return (
    <div className="text-center">
      <h1 className="text-4xl font-semibold tracking-tight">{title}</h1>

      {description ? (
        <div className="text-[1.125rem] leading-relaxed max-w-[48rem] mx-auto">
          <RichText
            data={description}
            enableGutter={false}
            enableProse={false}
          />
        </div>
      ) : null}

      <ProductsGrid products={products} currentSlug={slug} />
    </div>
  );
}
