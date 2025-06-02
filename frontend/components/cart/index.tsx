"use client";
import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import { Dialog, DialogContent } from "@mui/material";

import {
  CartCheckoutSection,
  CartEmptyState,
  CartHeader,
  CartItemList,
} from "./cart-content";
import { RootState } from "lib/store";
import { updateItem } from "lib/store/cartSlice";
import { OpenCart } from "./cart-buttons";
import { localeCache } from "lib/api";

export default function Cart() {
  const router = useRouter();
  const dispatch = useDispatch();

  const cart = useSelector((state: RootState) => state.cart);
  const [isOpen, setIsOpen] = useState(false);
  const quantityRef = useRef(cart?.totalQuantity);

  useEffect(() => {
    if (
      cart?.totalQuantity &&
      cart.totalQuantity !== quantityRef.current &&
      cart.totalQuantity > 0
    ) {
      if (!isOpen) setIsOpen(true);
      quantityRef.current = cart.totalQuantity;
    }
  }, [cart?.totalQuantity, isOpen]);

  const openCart = () => setIsOpen(true);
  const closeCart = () => setIsOpen(false);
  const redirectToCheckout = () => {
    closeCart();
    router.push("/checkout");
  };

  const optimisticUpdate = (
    productId: number,
    updateType: "plus" | "minus" | "delete",
  ) => {
    dispatch(updateItem({ productId, updateType }));
  };
  const hasItems = cart?.lines.length > 0;
  return (
    <>
      <button
        data-testid="open-cart-button"
        aria-label="Open cart"
        onClick={openCart}
      >
        <OpenCart quantity={cart?.totalQuantity} />
      </button>

      <Dialog
        data-testid="cart"
        open={isOpen}
        onClose={closeCart}
        hideBackdrop
        fullScreen
        sx={{
          "& .MuiDialog-paper": {
            position: "fixed",
            top: 0,
            bottom: 0,
            [localeCache.isRtl() ? "left" : "right"]: 0,
            height: "100vh",
            width: { xs: "100%", sm: 390 },
            m: 0,
            borderRadius: 0,
            [localeCache.isRtl() ? "borderRight" : "borderLeft"]:
              "1px solid var(--color-border)",
            bgcolor: "var(--color-bg)",
            color: "var(--color-text)",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
          },
        }}
      >
        <CartHeader closeCart={closeCart} />
        <DialogContent
          sx={{
            px: 2,
            pt: 0,
            pb: { xs: 17, md: 2 },
            flex: 1,
            overflowY: "auto",
          }}
        >
          {hasItems ? (
            <CartItemList
              cart={cart}
              optimisticUpdate={optimisticUpdate}
              closeCart={closeCart}
            />
          ) : (
            <CartEmptyState />
          )}
        </DialogContent>
        {hasItems && (
          <CartCheckoutSection
            cart={cart}
            redirectToCheckout={redirectToCheckout}
          />
        )}
      </Dialog>
    </>
  );
}
