"use client";
import { memo } from "react";
import { FormattedMessage } from "react-intl";
import { Box, Button, IconButton } from "@mui/material";
import {
  Add as AddIcon,
  Remove as RemoveIcon,
  Delete as DeleteIcon,
  ShoppingCart as ShoppingCartIcon,
} from "@mui/icons-material";
import type { CartItem } from "@/lib/types";
import { localeCache } from "@/lib/api";

export const DeleteItemButton = memo(
  ({
    item,
    optimisticUpdate,
  }: {
    item: CartItem;
    optimisticUpdate: (productId: number, updateType: "delete") => void;
  }) => (
    <IconButton
      data-testid="cart-delete-item"
      onClick={() => optimisticUpdate(item.productId, "delete")}
      aria-label="Remove cart item"
      size="small"
      sx={{
        color: "#e50707",
        "&:hover": {
          backgroundColor: "#4b5563",
        },
      }}
    >
      <DeleteIcon fontSize="small" />
    </IconButton>
  ),
);

export const EditItemQuantityButton = memo(
  ({
    item,
    type,
    optimisticUpdate,
  }: {
    item: CartItem;
    type: "plus" | "minus";
    optimisticUpdate: (id: number, type: "plus" | "minus") => void;
  }) => {
    const Icon = type === "plus" ? AddIcon : RemoveIcon;
    const ariaLabel =
      type === "plus" ? "Increase item quantity" : "Reduce item quantity";

    return (
      <IconButton
        data-testid={`cart-qty-${type}`}
        onClick={() => optimisticUpdate(item.productId, type)}
        aria-label={ariaLabel}
        size="small"
        sx={{
          minWidth: 36,
          maxWidth: 36,
          height: "100%",
          borderRadius: "9999px",
          padding: "8px",
          "&:hover": {
            opacity: 0.8,
          },
        }}
      >
        <Icon fontSize="inherit" sx={{ color: "text.secondary" }} />
      </IconButton>
    );
  },
);

export const OpenCart = memo(
  ({ quantity, onClick }: { quantity?: number; onClick?: () => void }) => (
    <IconButton
      onClick={onClick}
      data-testid="open-cart-button"
      aria-label="Open cart"
      sx={{
        position: "relative",
        width: "2.75rem",
        height: "2.75rem",
        borderRadius: "0.375rem",
        bgcolor: "transparent",
        color: "inherit",
        border: quantity ? "1px solid" : "none",
        borderColor: "primary.main",
      }}
    >
      <ShoppingCartIcon fontSize="small" />
      {quantity ? (
        <Box
          sx={{
            position: "absolute",
            top: 0,
            [localeCache.isRtl() ? "right" : "left"]: 0,
            transform: `${localeCache.isRtl() ? "translate(40%, -40%)" : "translate(-40%, -40%)"}`,
            width: "1rem",
            height: "1rem",
            borderRadius: "0.25rem",
            bgcolor: "primary.main",
            color: "#fff",
            fontSize: "0.6875rem",
            fontWeight: 500,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            lineHeight: 1,
          }}
        >
          {quantity}
        </Box>
      ) : null}
    </IconButton>
  ),
);
export const CheckoutButton = memo(({ onClick }: { onClick: () => void }) => (
  <Button
    data-testid="cart-checkout"
    onClick={onClick}
    variant="contained"
    fullWidth
    size="large"
    type="button"
  >
    <FormattedMessage id="cart.checkout" />
  </Button>
));
