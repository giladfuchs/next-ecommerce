"use client";

import dynamic from "next/dynamic";

export const AutoScrollRow = dynamic(
  () =>
    import("@/components/shared/elements-client").then(
      (module) => module.AutoScrollRowClient,
    ),
  {
    ssr: false,
    loading: () => (
      <div className="flex gap-4 overflow-hidden" aria-hidden="true">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="min-w-[75%] sm:min-w-[50%] md:min-w-[33%] lg:min-w-[25%] animate-pulse"
          >
            <div className="aspect-square w-full rounded-lg bg-gray-200 dark:bg-gray-800" />
            <div className="mt-2 h-4 w-3/4 rounded bg-gray-200 dark:bg-gray-800" />
            <div className="mt-1 h-4 w-1/2 rounded bg-gray-200 dark:bg-gray-800" />
          </div>
        ))}
      </div>
    ),
  },
);
export const Header = dynamic(() => import("@/components/layout/header"), {
  ssr: false,
  loading: () => (
    <header className="w-full border-b">
      <div className="container h-[5rem] flex items-center justify-between animate-pulse">
        {/* Logo */}
        <div className="h-6 w-32 rounded bg-neutral-200 dark:bg-neutral-800" />

        {/* Desktop Navigation */}
        <div className="hidden lg:flex items-center gap-8">
          <div className="h-4 w-16 rounded bg-neutral-200 dark:bg-neutral-800" />
          <div className="h-4 w-20 rounded bg-neutral-200 dark:bg-neutral-800" />
          <div className="h-4 w-14 rounded bg-neutral-200 dark:bg-neutral-800" />
        </div>

        {/* Right Icons */}
        <div className="flex items-center gap-4">
          <div className="h-8 w-8 rounded-full bg-neutral-200 dark:bg-neutral-800" />
          <div className="h-8 w-8 rounded-full bg-neutral-200 dark:bg-neutral-800" />
          <div className="h-8 w-8 rounded-full bg-neutral-200 dark:bg-neutral-800" />
        </div>
      </div>
    </header>
  ),
});
export const Checkout = dynamic(() => import("src/components/shop/checkout"), {
  ssr: false,
});

export const ProductPurchaseSection = dynamic(
  () => import("@/components/shop/product/product-purchase-section"),
  { ssr: false, loading: () => <div className="min-h-[280px]" /> },
);

export const ReviewForm = dynamic(
  () => import("@/components/shop/product/review/review-form"),
  {
    ssr: false,
  },
);
