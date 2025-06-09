"use client";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useRef, useState, useMemo } from "react";
import {
  NoProductsMessage,
  SearchResultsMessage,
} from "components/shared/messages";
import Grid from "components/products/grid";
import { Product } from "lib/types";
import { ProductItem } from "components/products/grid";
import { GridTileImage } from "components/products/grid/tile";
import { PRODUCTS_PER_PAGE } from "lib/config/config";
import { filterBySearch } from "lib/helper";

const ProductsDisplay = ({ products }: { products: Product[] }) => {
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

const ProductsInfinite = ({ products }: { products: Product[] }) => {
  const [page, setPage] = useState(1);
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const observer = useRef<IntersectionObserver | null>(null);
  const loadingRef = useRef(false);

  const visibleProducts = products.slice(0, page * PRODUCTS_PER_PAGE);
  const hasMore = visibleProducts.length < products.length;

  useEffect(() => {
    if (!hasMore) return;

    const node = sentinelRef.current;
    if (!node) return;

    observer.current?.disconnect();

    const newObserver = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry?.isIntersecting && !loadingRef.current) {
          loadingRef.current = true;
          setPage((prev) => prev + 1);
        }
      },
      { threshold: 0.1 },
    );

    newObserver.observe(node);
    observer.current = newObserver;

    return () => {
      newObserver.disconnect();
    };
  }, [hasMore, page, products]);

  useEffect(() => {
    loadingRef.current = false;
  }, [page]);

  return (
    <>
      <ProductsDisplay products={visibleProducts} />
      {hasMore && (
        <div
          ref={sentinelRef}
          data-testid="infinite-scroll-sentinel"
          style={{ height: 100 }}
        />
      )}
    </>
  );
};
const ProductsLayout = ({ products }: { products: Product[] }) => {
  const searchParams = useSearchParams();
  const searchValue = useMemo(
    () => searchParams.get("q") || "",
    [searchParams],
  );

  const filteredProducts = useMemo(
    () => filterBySearch(products, searchValue),
    [searchValue, products],
  );

  return (
    <>
      {searchValue && <SearchResultsMessage count={filteredProducts.length} />}

      {filteredProducts.length > 0 ? (
        <div data-testid="product-list" className="container mx-auto px-4">
          <Grid className="grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            <ProductsInfinite products={filteredProducts} />
          </Grid>
        </div>
      ) : (
        <div data-testid="no-products" className="container mx-auto px-4">
          <NoProductsMessage />
        </div>
      )}
    </>
  );
};
export default ProductsLayout;
