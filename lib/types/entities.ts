import { OrderStatus } from "./enums";

export type Category = {
  id: number;
  handle: string;
  title: string;
  position: number;
  updatedAt: string;
};

export type Image = {
  url: string;
  altText: string;
};

export type Product = {
  id: number;
  handle: string;
  category: string;
  available: boolean;
  title: string;
  description: string;
  price: number;
  featuredImage: Image;
  images: Image[];
  updatedAt: string;
};

export type CartItem = {
  productId: number;
  handle: string;
  title: string;
  imageUrl: string;
  imageAlt: string;
  quantity: number;
  unitAmount: number;
  totalAmount: number;
};

export type Cart = {
  totalQuantity: number;
  lines: CartItem[];
  cost: number;
  createdAt: number;
};

export type OrderItem = {
  id: number;
  productId: number;
  handle: string;
  title: string;
  imageUrl: string;
  imageAlt: string;
  quantity: number;
  unitAmount: number;
  totalAmount: number;
};

export type Order = {
  id: number;
  name: string;
  email: string;
  phone: string;
  totalQuantity: number;
  cost: number;
  status: OrderStatus;
  createdAt: Date;
  items: OrderItem[];
};

export type NewOrderPayload = {
  name: string;
  email: string;
  phone: string;
  cart: Cart;
  agreed?: boolean;
};
