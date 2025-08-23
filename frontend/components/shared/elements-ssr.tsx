import Link from "next/link";
import { ComponentProps } from "react";
import { Typography } from "@mui/material";
import { localeCache } from "@/lib/api";
import { Product } from "@/lib/types";
import { ProductItem } from "../products/grid";
import GridTileImage from "../products/grid/tile";
import { Products } from "./wrappers";
import { shuffleArray } from "@/lib/helper";

export const Price = ({
  amount,
  ...props
}: {
  amount: number;
} & ComponentProps<typeof Typography>) => {
  const locale = "he-IL";
  const formatOptions: Intl.NumberFormatOptions = {
    style: "currency",
    currency: localeCache.isRtl() ? "ILS" : "USD",
    currencyDisplay: "narrowSymbol",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  } as Intl.NumberFormatOptions;

  return (
    <Typography component="span" suppressHydrationWarning {...props}>
      {new Intl.NumberFormat(locale, formatOptions).format(amount)}
    </Typography>
  );
};

export const ProductsDisplay = ({ products }: { products: Product[] }) => {
  return (
    <>
      {products.map((product) => (
        <ProductItem key={product.handle}>
          <Link
            href={`/product/${product.handle}`}
            prefetch
            data-testid={`product-link-${product.handle}`}
            style={{
              display: "block",
              position: "relative",
              width: "100%",
              height: "100%",
            }}
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
    <div className="sr-only" aria-hidden="true">
      <ProductsDisplay products={shuffleArray(products).slice(0, 5)} />
    </div>
    <Products products={products} />
  </>
);
