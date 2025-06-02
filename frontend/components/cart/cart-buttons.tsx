"use client";
import { memo } from "react";
import { FormattedMessage } from "react-intl";
import { Box, Button, IconButton } from "@mui/material";
import {
  Add as AddIcon,
  Remove as RemoveIcon,
  Close as CloseIcon,
  ShoppingCart as ShoppingCartIcon,
} from "@mui/icons-material";
import type { CartItem } from "lib/types";

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
        backgroundColor: "#6b7280",
        color: "#fff",
        "&:hover": {
          backgroundColor: "#4b5563",
        },
        width: 24,
        height: 24,
      }}
    >
      <CloseIcon fontSize="small" />
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
  ({ className, quantity }: { className?: string; quantity?: number }) => (
    <Box
      data-testid="cart-open"
      className={`relative flex h-11 w-11 items-center justify-center rounded-md border border-theme text-theme-strong transition-colors dark:border-theme dark:text-theme-strong ${className || ""}`}
    >
      <ShoppingCartIcon
        fontSize="small"
        className="transition-all ease-in-out hover:scale-110"
      />
      {quantity ? (
        <div className="absolute right-0 top-0 -mr-2 -mt-2 h-4 w-4 rounded-sm bg-blue-600 text-[11px] font-medium text-white">
          {quantity}
        </div>
      ) : null}
    </Box>
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
