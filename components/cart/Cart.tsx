"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Dialog,
  DialogContent,
  IconButton,
  Typography,
  Box,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import Price from "components/shared/Price";

import { RootState } from "../../lib/store";
import { updateItem } from "../../lib/store/cartSlice";
import {
  DeleteItemButton,
  EditItemQuantityButton,
  OpenCart,
  CheckoutButton,
} from "./CartButtons";
import { FormattedMessage } from "react-intl";
import { localeCache } from "../../lib/api";

export default function Cart() {
  const router = useRouter();
  const dispatch = useDispatch();
  const cart = useSelector((state: RootState) => state.cart);
  const [isOpen, setIsOpen] = useState(false);
  const [highContrast, setHighContrast] = useState(false);
  const quantityRef = useRef(cart?.totalQuantity);
  const isRtl = localeCache.isRtl();

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
    const checkContrast = () => {
      const isHigh =
        document.documentElement.classList.contains("high-contrast");
      setHighContrast(isHigh);
    };
    checkContrast();
    const observer = new MutationObserver(checkContrast);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });
    return () => observer.disconnect();
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
            [isRtl ? "left" : "right"]: 0,
            height: "100vh",
            width: { xs: "100%", sm: 390 },
            m: 0,
            borderRadius: 0,
            [isRtl ? "borderRight" : "borderLeft"]:
              "1px solid var(--color-border)",
            bgcolor: highContrast ? "black" : "var(--color-bg)",
            color: highContrast ? "yellow" : "var(--color-text)",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
          },
        }}
      >
        <Box
          display="flex"
          alignItems="center"
          justifyContent="space-between"
          p={2}
          sx={{ textAlign: isRtl ? "right" : "left" }}
        >
          <Typography fontWeight="bold" fontSize="1.25em">
            <FormattedMessage id="cart.title" />
          </Typography>
          <IconButton
            onClick={closeCart}
            aria-label="Close cart"
            sx={{ color: highContrast ? "yellow" : "inherit" }}
            data-testid="close-cart-button"
          >
            <CloseIcon />
          </IconButton>
        </Box>

        <DialogContent
          sx={{
            px: 2,
            pt: 0,
            pb: { xs: 17, md: 2 },
            flex: 1,
            overflowY: "auto",
          }}
        >
          {cart?.lines.length === 0 ? (
            <Box
              mt={10}
              display="flex"
              flexDirection="column"
              alignItems="center"
            >
              <ShoppingCartIcon
                sx={{
                  fontSize: 48,
                  color: highContrast ? "yellow" : "inherit",
                }}
              />
              <Typography
                mt={2}
                fontWeight="bold"
                fontSize="1.5em"
                textAlign="center"
              >
                <FormattedMessage id="cart.empty" />
              </Typography>
            </Box>
          ) : (
            <Box component="ul" py={2} data-testid="cart-list">
              {cart.lines
                .filter((item) => item?.title)
                .sort((a, b) => a.title.localeCompare(b.title))
                .map((item, i) => (
                  <li
                    key={i}
                    className="flex w-full flex-col border-b border-neutral-300 dark:border-neutral-700 pb-2"
                  >
                    <div className="flex items-start justify-between gap-4 px-1 py-4">
                      <div className="relative h-16 w-16 flex-shrink-0">
                        <Image
                          className="h-full w-full rounded-md border border-neutral-300 bg-neutral-300 object-cover dark:border-neutral-700 dark:bg-neutral-900"
                          width={64}
                          height={64}
                          alt={item.imageAlt || item.title}
                          src={item.imageUrl}
                        />
                        <div
                          className={`absolute top-0 z-10 ${isRtl ? "right-0" : "left-0"}`}
                        >
                          <DeleteItemButton
                            item={item}
                            optimisticUpdate={optimisticUpdate}
                          />
                        </div>
                      </div>

                      <div className="flex flex-1 flex-col justify-between">
                        <div className="flex items-center justify-between">
                          <Link
                            href={`/product/${item.handle}`}
                            onClick={closeCart}
                          >
                            <h2
                              className="font-bold text-theme leading-tight m-0"
                              style={{ textAlign: isRtl ? "right" : "left" }}
                            >
                              {item.title}
                            </h2>
                          </Link>
                          <Box
                            sx={{
                              minWidth: 80,
                              textAlign: isRtl ? "right" : "left",
                            }}
                          >
                            <Price
                              className="text-base font-bold"
                              amount={item.totalAmount}
                            />
                          </Box>
                        </div>

                        <div className="mt-2 flex items-center justify-between">
                          <Price
                            className="text-sm font-medium"
                            amount={item.unitAmount}
                          />
                          <div
                            className="flex h-9 flex-row items-center rounded-full border border-neutral-200 dark:border-neutral-700"
                            data-testid="quantity-buttons"
                          >
                            <EditItemQuantityButton
                              item={item}
                              type="minus"
                              optimisticUpdate={optimisticUpdate}
                            />
                            <span
                              className="w-6 text-center text-sm"
                              data-testid="cart-item-qty"
                            >
                              {item.quantity}
                            </span>
                            <EditItemQuantityButton
                              item={item}
                              type="plus"
                              optimisticUpdate={optimisticUpdate}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
            </Box>
          )}
        </DialogContent>

        {cart?.lines.length > 0 && (
          <Box
            sx={{
              display: { xs: "flex", md: "none" },
              position: "fixed",
              bottom: 0,
              left: 0,
              right: 0,
              zIndex: 10,
              bgcolor: "var(--color-bg)",
              borderTop: "1px solid var(--color-border)",
              flexDirection: "column",
              px: 2,
              py: 2,
            }}
          >
            <Box
              display="flex"
              justifyContent="space-between"
              mb={1}
              sx={{ textAlign: isRtl ? "right" : "left" }}
            >
              <Typography fontWeight="bold">
                <FormattedMessage id="checkout.total" />
              </Typography>
              <Price amount={cart.cost} />
            </Box>
            <div data-testid="cart-checkout-mobile">
              <CheckoutButton onClick={redirectToCheckout} />
            </div>
          </Box>
        )}

        {cart?.lines.length > 0 && (
          <Box
            sx={{
              display: { xs: "none", md: "flex" },
              flexDirection: "column",
              borderTop: "1px solid var(--color-border)",
              bgcolor: "var(--color-bg)",
              px: 2,
              py: 2,
            }}
          >
            <Box display="flex" justifyContent="space-between" mb={1}>
              <Typography fontWeight="bold">
                <FormattedMessage id="checkout.total" />
              </Typography>
              <Price amount={cart.cost} />
            </Box>
            <div data-testid="cart-checkout-desktop">
              <CheckoutButton onClick={redirectToCheckout} />
            </div>
          </Box>
        )}
      </Dialog>
    </>
  );
}
