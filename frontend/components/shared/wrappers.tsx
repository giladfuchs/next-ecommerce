"use client";
import dynamic from "next/dynamic";
import { Product } from "../../lib/types";
const ProductsClient = dynamic(() => import("components/products"), {
  ssr: false,
});
export const Products = (props: { products: Product[] }) => (
  <ProductsClient {...props} />
);
