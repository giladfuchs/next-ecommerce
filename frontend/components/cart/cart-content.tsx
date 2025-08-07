"use client";
import NextLink from "next/link";
import { FormattedMessage } from "react-intl";
import Image from "next/image";
import {
  IconButton,
  Typography,
  Box,
  useMediaQuery,
  Divider,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import {
  DeleteItemButton,
  EditItemQuantityButton,
  CheckoutButton,
} from "./cart-buttons";
import { Price } from "@/components/shared/elements-ssr";
import { RootState } from "@/lib/store";
import { localeCache } from "@/lib/api";
import { useTheme } from "@mui/system";
import React from "react";
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
  <Box
    component="ul"
    py={2}
    px={0}
    data-testid="cart-list"
    sx={{
      listStyle: "none",
      m: 0,
    }}
  >
    {cart.lines
      .filter((item) => item?.title)
      .sort((a, b) => a.title.localeCompare(b.title))
      .map((item, i) => (
        <Box
          component="li"
          key={i}
          sx={{
            display: "flex",
            flexDirection: "column",
            width: "100%",
            borderBottom: "1px solid",
            borderColor: "divider",
            "&:last-of-type": {
              borderBottom: "none",
            },
          }}
        >
          <Box
            sx={{
              display: "flex",
              gap: "1rem",
              justifyContent: "space-between",
              alignItems: "flex-start",
              px: 1,
              py: 2,
            }}
          >
            <Box
              sx={{
                position: "relative",
                width: 64,
                height: 64,
                flexShrink: 0,
              }}
            >
              <Image
                width={64}
                height={64}
                alt={item.imageAlt || item.title}
                src={item.imageUrl}
                style={{
                  width: "100%",
                  height: "100%",
                  borderRadius: "0.375rem",
                  border: "1px solid var(--theme-border, #ccc)",
                  background: "var(--theme-bg, #eee)",
                  objectFit: "cover",
                }}
              />
            </Box>

            <Box
              sx={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <Typography
                  component={NextLink}
                  href={`/product/${item.handle}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  variant="subtitle1"
                  fontWeight="bold"
                  color="text.primary"
                  lineHeight={1.2}
                  textAlign={localeCache.isRtl() ? "right" : "left"}
                  sx={{
                    textDecoration: "none",
                    "&:hover": {
                      textDecoration: "underline",
                    },
                  }}
                >
                  {item.title}
                </Typography>
                <Box
                  sx={{
                    minWidth: 80,
                    textAlign: localeCache.isRtl() ? "right" : "left",
                  }}
                >
                  <Price amount={item.totalAmount} />
                </Box>
              </Box>

              <Box
                sx={{
                  mt: 2,
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <Price
                  amount={item.unitAmount}
                  sx={{ fontSize: "0.875rem", fontWeight: 500 }}
                />
                <DeleteItemButton
                  item={item}
                  optimisticUpdate={optimisticUpdate}
                />

                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "row",
                    alignItems: "center",
                    height: "2.25rem",
                    borderRadius: "999px",
                    border: "1px solid",
                    borderColor: "divider",
                    overflow: "hidden",
                  }}
                  data-testid="quantity-buttons"
                >
                  <EditItemQuantityButton
                    item={item}
                    type="minus"
                    optimisticUpdate={optimisticUpdate}
                  />
                  <Box
                    sx={{
                      width: "1.5rem",
                      textAlign: "center",
                      fontSize: "0.875rem",
                    }}
                    data-testid="cart-item-qty"
                  >
                    {item.quantity}
                  </Box>
                  <EditItemQuantityButton
                    item={item}
                    type="plus"
                    optimisticUpdate={optimisticUpdate}
                  />
                </Box>
              </Box>
            </Box>
          </Box>
        </Box>
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
