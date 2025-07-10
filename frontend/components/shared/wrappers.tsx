"use client";
import dynamic from "next/dynamic";
import { Product } from "../../lib/types";
const ProductsClient = dynamic(() => import("components/products"), {
  ssr: false,
});
export const Products = (props: { products: Product[] }) => (
  <ProductsClient {...props} />
);

export const HeaderControls = dynamic(
  () => import("components/layout/header/header-controls"),
  { ssr: false },
);
export const AccessibilityBar = dynamic(
  () => import("components/layout/accessibility-bar"),
  { ssr: false },
);
