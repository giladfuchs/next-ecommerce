"use client";

import { useEffect, useRef, useState } from "react";
import { Product } from "lib/types";
import ProductItems from "components/product/ProductItems";

const PRODUCTS_PER_PAGE = 3;

export default function ProductGrid({ products }: { products: Product[] }) {
  const [page, setPage] = useState(1);
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const observer = useRef<IntersectionObserver | null>(null);
  const loadingRef = useRef(false);

  const visibleProducts = products.slice(0, page * PRODUCTS_PER_PAGE);
  const hasMore = visibleProducts.length < products.length;

  useEffect(() => {
    if (!hasMore) return;

    observer.current?.disconnect();

    observer.current = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry?.isIntersecting && !loadingRef.current) {
          loadingRef.current = true;
          setPage((prev) => prev + 1);
        }
      },
      { threshold: 0.1 },
    );

    const node: HTMLDivElement | null = sentinelRef.current;
    if (node) {
      observer.current?.observe(node);
    }
    return () => {
      observer.current?.disconnect();
    };
  }, [hasMore, visibleProducts.length]);

  useEffect(() => {
    loadingRef.current = false;
  }, [page]);

  return (
    <>
      <ProductItems products={visibleProducts} />

      {hasMore && (
        <div
          ref={sentinelRef}
          data-testid="infinite-scroll-sentinel"
          style={{ height: 100 }}
        />
      )}
    </>
  );
}
