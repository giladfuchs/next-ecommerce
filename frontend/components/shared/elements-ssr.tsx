import Link from "next/link";
import { ComponentProps } from "react";
import { localeCache } from "lib/api";
import { Product } from "lib/types";
import { ProductItem } from "../products/grid";
import { GridTileImage } from "../products/grid/tile";
import { Products } from "./wrappers";

export const Price = ({
  amount,
  className,
}: {
  amount: number;
  className?: string;
  currencyCodeClassName?: string;
} & ComponentProps<"p">) => {
  const locale = "he-IL";
  const formatOptions: Intl.NumberFormatOptions = {
    style: "currency",
    currency: localeCache.isRtl() ? "ILS" : "USD",
    currencyDisplay: "narrowSymbol",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  };

  return (
    <span suppressHydrationWarning className={className}>
      {new Intl.NumberFormat(locale, formatOptions).format(amount)}
    </span>
  );
};

export const ProductsDisplay = ({ products }: { products: Product[] }) => {
  return (
    <>
      {products.map((product) => (
        <ProductItem
          key={product.handle}
          className="animate-fadeIn w-full max-w-full overflow-hidden"
        >
          <Link
            href={`/product/${product.handle}`}
            prefetch
            className="relative block h-full w-full"
            data-testid={`product-link-${product.handle}`}
          >
            <GridTileImage
              src={product.featuredImage.url}
              alt={product.title}
              label={{
                title: product.title,
                amount: product.price,
              }}
              fill
              sizes="(min-width: 768px) 33vw, (min-width: 640px) 50vw, 100vw"
            />
          </Link>
        </ProductItem>
      ))}
    </>
  );
};

export const ProductsSSR = ({ products }: { products: Product[] }) => (
  <>
    <div className="sr-only">
      <ProductsDisplay products={products.slice(0, 5)} />
    </div>
    <Products products={products} />
  </>
);
