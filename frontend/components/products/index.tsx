"use client";
import { useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { Box } from "@mui/material";
import { Product } from "@/lib/types";
import { PRODUCTS_PER_PAGE } from "@/lib/config";
import { filterBySearch } from "@/lib/helper";
import ProductsGrid from "@/components/products/grid";
import { ProductsDisplay } from "@/components/shared/elements-ssr";
import {
  NoProductsMessage,
  SearchResultsMessage,
} from "@/components/shared/messages";
import {useInfiniteScroll} from "@/components/shared/elements-client";
export default function ProductsClient({ products }: { products: Product[] }) {
  const searchParams = useSearchParams();
  const searchValue = useMemo(
      () => searchParams.get("q") || "",
      [searchParams],
  );

  const filteredProducts = useMemo(
      () => filterBySearch(products, searchValue),
      [searchValue, products],
  );

  const { visibleItems, hasMore, sentinelRef } = useInfiniteScroll<Product>(
      filteredProducts,
      PRODUCTS_PER_PAGE,
      "products_infinite_page",
  );

  return (
      <>
        {searchValue && <SearchResultsMessage count={filteredProducts.length} />}
        {filteredProducts.length > 0 ? (
            <ProductsGrid>
              <ProductsDisplay products={visibleItems} />
              {hasMore && (
                  <Box
                      ref={sentinelRef}
                      data-testid="infinite-scroll-sentinel"
                      sx={{ height: 100 }}
                  />
              )}
            </ProductsGrid>
        ) : (
            <NoProductsMessage />
        )}
      </>
  );
}