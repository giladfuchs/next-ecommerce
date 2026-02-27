import type { Cart, Order, Product } from "@/lib/core/types/payload-types";

export enum RoutePath {
  product = "product",
  category = "category",
}

export enum CollectionName {
  products = "products",
  category = "category",
}
export type PropsSlug = { params: Promise<{ slug: string }> };

export type CartItem = NonNullable<Cart["items"]>[number];
export type OrderItem = NonNullable<Order["items"]>[number];

export type ProductPurchaseSectionData = {
  id: Product["id"];
  inventory: number;
  price: number;
  variants: Array<{
    typeId: number | string;
    typeLabel: string;
    options: Array<{
      id: string;
      label: string;
      inventory: number;
      price: number;
    }>;
  }>;
  priceRange: {
    min: number;
    max: number;
  };
};

export type CombinedVariantData = {
  variants: {
    id: number;
    options: number[];
    inventory: number;
    priceInUSD: number;
  }[];
  variantTypes: {
    id: number;
    label: string;
  }[];
  options: {
    id: number;
    variantType: number;
    label: string;
  }[];
} | null;

export type ProductSinglePage = Pick<
  Product,
  "title" | "description" | "updatedAt" | "gallery" | "faqs"
> & {
  purchase_section: ProductPurchaseSectionData;
  relatedProducts: Product[];
};

export type CheckoutFormData = {
  name: string;
  phone: string;
  email: string;
};

export type CheckoutFormProps = {
  cartId: number | undefined;
  clearCart: undefined | (() => Promise<void> | void);
  onSuccess: (orderId: string) => void;
};
