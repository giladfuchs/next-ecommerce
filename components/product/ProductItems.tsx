import Link from "next/link";
import { ProductItem } from "components/product/grid";
import { GridTileImage } from "components/product/grid/tile";
import { Product } from "lib/types";

export default function ProductItems({ products }: { products: Product[] }) {
  return (
    <>
      {products.map((product) => (
        <ProductItem
          key={product.handle}
          className="animate-fadeIn w-full max-w-full overflow-hidden"
        >
          <Link
            className="relative block h-full w-full"
            href={`/product/${product.handle}`}
            prefetch={true}
          >
            <GridTileImage
              alt={product.title}
              label={{
                title: product.title,
                amount: product.price,
              }}
              src={product.featuredImage.url}
              fill
              sizes="(min-width: 768px) 33vw, (min-width: 640px) 50vw, 100vw"
            />
          </Link>
        </ProductItem>
      ))}
    </>
  );
}
