"use client";

import dynamic from "next/dynamic";

export const BackButton = dynamic(
  () =>
    import("@/components/shared/elements-client").then(
      (m) => m.BackButtonClient,
    ),
  {
    ssr: false,
    loading: () => (
      <div className="h-10 w-24 rounded-md bg-gray-200 animate-pulse" />
    ),
  },
);

export const CategoriesDropdown = dynamic(
  () =>
    import("@/components/shared/elements-client").then(
      (m) => m.CategoriesDropdownClient,
    ),
  {
    ssr: false,
    loading: () => (
      <div className="h-10 w-full animate-pulse bg-neutral-200 dark:bg-neutral-800 rounded-md" />
    ),
  },
);

export const AutoScrollRow = dynamic(
  () => import("@/components/shared/auto-scroll-row"),
  {
    ssr: false,
    loading: () => (
      <div className="flex gap-4 overflow-hidden">
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
export const Checkout = dynamic(() => import("@/components/checkout"), {
  ssr: false,
});

export const ProductPurchaseSection = dynamic(
  () => import("@/components/product/product-purchase-section"),
  { ssr: false },
);

export const ReviewForm = dynamic(
  () => import("@/components/product/review/review-form"),
  {
    ssr: false,
  },
);
