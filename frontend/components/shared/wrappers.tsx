"use client";
import dynamic from "next/dynamic";
import { Category, Product } from "@/lib/types";
import { PropsProductGallery } from "@/components/products/single/product-gallery";
import { PropsProductButtons } from "@/components/products/single/product-buttons";

const ProductsClient = dynamic(() => import("@/components/products"), {
  ssr: false,
});
export const Products = (props: { products: Product[] }) => (
  <ProductsClient {...props} />
);
const ProductGalleryClient = dynamic(
  () => import("@/components/products/single/product-gallery"),
  {
    ssr: false,
  },
);
export const ProductGallery = (props: PropsProductGallery) => (
  <ProductGalleryClient {...props} />
);
const ProductButtonsClient = dynamic(
  () => import("@/components/products/single/product-buttons"),
  {
    ssr: false,
  },
);
export const ProductButtons = (props: PropsProductButtons) => (
  <ProductButtonsClient {...props} />
);
const CategoryAutocompleteClient = dynamic(
  () =>
    import("components/shared/elements-client").then((mod) => ({
      default: mod.CategoryAutocompleteClient,
    })),
  { ssr: false },
);
export const CategoryAutocomplete = (props: { options: Category[] }) => (
  <CategoryAutocompleteClient {...props} />
);

export const HeaderControls = dynamic(
  () => import("@/components/layout/header/header-controls"),
  { ssr: false },
);
export const AccessibilityBar = dynamic(
  () => import("@/components/layout/accessibility-bar"),
  { ssr: false },
);
