"use client";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Dialog, DialogContent } from "@mui/material";
import {
  CartCheckoutSection,
  CartEmptyState,
  CartHeader,
  CartItemList,
} from "./cart-content";
import { OpenCart } from "./cart-buttons";
import { updateItem, useAppDispatch, useAppSelector } from "@/lib/store";
import { localeCache } from "@/lib/api";

export default function Cart() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const cart = useAppSelector((state) => state.cart);

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
  useEffect(() => {
    const handleOpen = () => setIsOpen(true);
    window.addEventListener("open-cart", handleOpen);
    return () => window.removeEventListener("open-cart", handleOpen);
  }, []);
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
      <OpenCart onClick={openCart} quantity={cart?.totalQuantity} />
      <Dialog
        data-testid="cart"
        open={isOpen}
        slots={{ transition: undefined }}
        onClose={closeCart}
        hideBackdrop
        fullScreen
        sx={{
          "& .MuiDialog-paper": {
            position: "fixed",
            top: 0,
            bottom: 0,
            height: { xs: "90%", sm: "100vh" },
            width: { xs: "100%", sm: 390 },
            m: 0,
            borderRadius: 0,
            bgcolor: "var(--color-bg)",
            color: "var(--color-text)",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
            inset: {
              xs: 0,
              sm: localeCache.isRtl() ? "0 auto 0 0" : "0 0 0 auto",
            },
            border: "1px solid var(--color-border)",
            borderTop: "none",
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
