"use client";

import Grid from "components/product/grid";
import {
  NoProductsMessage,
  SearchResultsMessage,
} from "components/shared/messages";
import { Product } from "lib/types";
import { useSearchParams } from "next/navigation";
import { useMemo } from "react";
import ProductGrid from "./ProductGrid";

export default function ClientProduct({ products }: { products: Product[] }) {
  const searchParams = useSearchParams();
  const q = searchParams.get("q") || "";

  const filteredProducts = useMemo(() => {
    if (!q) return products;
    const regex = new RegExp(q, "i");
    return products.filter((product) =>
      regex.test(
        Object.values(product)
          .filter((value) => typeof value === "string")
          .join(" "),
      ),
    );
  }, [q, products]);

  return (
    <>
      {q && <SearchResultsMessage count={filteredProducts.length} />}

      {filteredProducts.length > 0 ? (
        <div data-testid="product-list" className="container mx-auto px-4">
          <Grid className="grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            <ProductGrid products={filteredProducts} />
          </Grid>
        </div>
      ) : (
        <div data-testid="no-products">
          <NoProductsMessage />
        </div>
      )}
    </>
  );
}
