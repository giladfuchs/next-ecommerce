/*
  Handles rehydration of the cart state from persisted storage.

  Details:
  - Cart product lines are disconnected from live backend product data.
  - The cart stores price, title, and availability as static values.
  - When an order is submitted, we do *not* re-fetch or re-validate product data from the backend.
    Whatever is stored in the cart is treated as final.

  Auto-expiration:
  - Each cart has a `createdAt` timestamp set upon initialization.
  - On rehydration, this timestamp is compared to the current time.
  - If more than 7 days have passed, the cart is considered expired and is reset.
  - Otherwise, the cart remains valid — even if edited on day 7, it resets on day 8.

  Summary:
  - Cart data is trusted as-is and not validated at checkout.
  - Cart auto-resets 7 days after initial creation (`createdAt`), regardless of interaction.
*/

import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Cart, CartItem, Product } from "lib/types";
import { createTransform } from "redux-persist";
import { SEVEN_DAYS } from "../config/config";

function createEmptyCart(): Cart {
  return {
    totalQuantity: 0,
    lines: [],
    cost: 0,
    createdAt: Date.now(),
  };
}

const initialState: Cart = createEmptyCart();

export const resetCartTransform = createTransform(
  (inboundState) => inboundState,
  (outboundState: any) => {
    const isValid =
      outboundState?.createdAt && Array.isArray(outboundState?.lines);
    const isExpired =
      isValid && Date.now() - outboundState.createdAt > SEVEN_DAYS;
    return isValid && !isExpired ? { ...outboundState } : createEmptyCart();
  },
  { whitelist: ["cart"] },
);

function calculateTotals(lines: CartItem[]) {
  const totalQuantity = lines.reduce((sum, item) => sum + item.quantity, 0);
  const totalAmount = lines.reduce((sum, item) => sum + item.totalAmount, 0);
  return { totalQuantity, totalAmount };
}

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    addItem(
      state = createEmptyCart(),
      action: PayloadAction<{ product: Product }>,
    ) {
      const { product } = action.payload;
      const existingItem = state.lines.find(
        (item) => item.productId === product.id,
      );
      const quantity = existingItem ? existingItem.quantity + 1 : 1;

      const updatedItem: CartItem = {
        productId: product.id,
        handle: product.handle,
        title: product.title,
        imageUrl: product.featuredImage.url,
        imageAlt: product.featuredImage.altText,
        quantity,
        unitAmount: product.price,
        totalAmount: product.price * quantity,
      };

      const updatedLines = existingItem
        ? state.lines.map((item) =>
            item.productId === product.id ? updatedItem : item,
          )
        : [...state.lines, updatedItem];

      const { totalQuantity, totalAmount } = calculateTotals(updatedLines);

      state.lines = updatedLines;
      state.totalQuantity = totalQuantity;
      state.cost = totalAmount;
    },

    updateItem(
      state = createEmptyCart(),
      action: PayloadAction<{
        productId: number;
        updateType: "plus" | "minus" | "delete";
      }>,
    ) {
      const { productId, updateType } = action.payload;

      const updatedLines = state.lines
        .map((item) => {
          if (item.productId !== productId) return item;
          if (updateType === "delete") return null;
          const newQuantity =
            updateType === "plus" ? item.quantity + 1 : item.quantity - 1;
          if (newQuantity <= 0) return null;
          return {
            ...item,
            quantity: newQuantity,
            totalAmount: item.unitAmount * newQuantity,
          };
        })
        .filter(Boolean) as CartItem[];

      const { totalQuantity, totalAmount } = calculateTotals(updatedLines);

      state.lines = updatedLines;
      state.totalQuantity = totalQuantity;
      state.cost = updatedLines.length > 0 ? totalAmount : 0;
    },

    clearCart(state) {
      Object.assign(state, createEmptyCart());
    },
  },
});

export const { addItem, updateItem, clearCart } = cartSlice.actions;
export default cartSlice.reducer;
