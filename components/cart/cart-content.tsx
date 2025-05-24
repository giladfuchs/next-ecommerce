"use client";
import { FormattedMessage } from "react-intl";
import Image from "next/image";
import Link from "next/link";
import { IconButton, Typography, Box, useMediaQuery } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import {
  DeleteItemButton,
  EditItemQuantityButton,
  CheckoutButton,
} from "./cart-buttons";
import { Price } from "components/shared/elements-ssr";
import { RootState } from "lib/store";
import { localeCache } from "lib/api";
import { useTheme } from "@mui/system";
export const CartHeader = ({ closeCart }: { closeCart: () => void }) => (
  <Box
    display="flex"
    alignItems="center"
    justifyContent="space-between"
    p={2}
    sx={{ textAlign: localeCache.isRtl() ? "right" : "left" }}
  >
    <Typography fontWeight="bold" fontSize="1.25em">
      <FormattedMessage id="cart.title" />
    </Typography>
    <IconButton
      onClick={closeCart}
      aria-label="Close cart"
      // sx={{ color: highContrast ? "yellow" : "inherit" }}
      data-testid="close-cart-button"
    >
      <CloseIcon />
    </IconButton>
  </Box>
);
export const CartEmptyState = () => (
  <Box mt={10} display="flex" flexDirection="column" alignItems="center">
    <ShoppingCartIcon
      sx={{
        fontSize: 48,
      }}
    />
    <Typography mt={2} fontWeight="bold" fontSize="1.5em" textAlign="center">
      <FormattedMessage id="cart.empty" />
    </Typography>
  </Box>
);
export const CartItemList = ({
  cart,
  optimisticUpdate,
  closeCart,
}: {
  cart: RootState["cart"];
  optimisticUpdate: (
    productId: number,
    updateType: "plus" | "minus" | "delete",
  ) => void;
  closeCart: () => void;
}) => (
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
                className={`absolute top-0 z-10 ${localeCache.isRtl() ? "right-0" : "left-0"}`}
              >
                <DeleteItemButton
                  item={item}
                  optimisticUpdate={optimisticUpdate}
                />
              </div>
            </div>

            <div className="flex flex-1 flex-col justify-between">
              <div className="flex items-center justify-between">
                <Link href={`/product/${item.handle}`} onClick={closeCart}>
                  <h2
                    className="font-bold text-theme leading-tight m-0"
                    style={{
                      textAlign: localeCache.isRtl() ? "right" : "left",
                    }}
                  >
                    {item.title}
                  </h2>
                </Link>
                <Box
                  sx={{
                    minWidth: 80,
                    textAlign: localeCache.isRtl() ? "right" : "left",
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
);

export const CartCheckoutSection = ({
  cart,
  redirectToCheckout,
}: {
  cart: RootState["cart"];
  redirectToCheckout: () => void;
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  return (
    <Box
      sx={{
        display: isMobile
          ? { xs: "flex", md: "none" }
          : { xs: "none", md: "flex" },
        position: isMobile ? "fixed" : "static",
        bottom: isMobile ? 0 : undefined,
        left: 0,
        right: 0,
        zIndex: isMobile ? 10 : undefined,
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
        sx={{ textAlign: localeCache.isRtl() ? "right" : "left" }}
      >
        <Typography fontWeight="bold">
          <FormattedMessage id="checkout.total" />
        </Typography>
        <Price amount={cart.cost} />
      </Box>
      <div data-testid={`cart-checkout-button`}>
        <CheckoutButton onClick={redirectToCheckout} />
      </div>
    </Box>
  );
};
