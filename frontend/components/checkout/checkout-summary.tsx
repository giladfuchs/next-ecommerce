"use client";
import { FormattedMessage } from "react-intl";
import { Box, Divider, Grid, Typography } from "@mui/material";
import { Price } from "@/components/shared/elements-ssr";
import { useAppSelector } from "@/lib/store";
import { localeCache } from "@/lib/api";
import { Cart, CartItem } from "@/lib/types";

const CheckoutSummaryItem = ({ product }: { product: CartItem }) => (
  <Grid
    key={product.productId}
    sx={{
      display: "flex",
      alignItems: "center",
      bgcolor: "var(--color-bg)",
      borderRadius: 2,
      p: 2,
      gap: 2,
      boxShadow: "0 2px 6px rgba(0,0,0,0.05)",
      direction: localeCache.dir(),
      color: "var(--color-text)",
      ".high-contrast &": {
        bgcolor: "#000",
        color: "#fff",
        border: "1px solid yellow",
      },
    }}
  >
    <Box
      component="img"
      src={product.imageUrl}
      alt={product.imageAlt}
      sx={{
        width: 80,
        height: 80,
        borderRadius: 2,
        objectFit: "cover",
        flexShrink: 0,
        ".high-contrast &": {
          filter: "brightness(1.2) contrast(1.2)",
        },
      }}
    />

    <Box
      sx={{
        flex: 1,
        minWidth: 0,
        textAlign: localeCache.isRtl() ? "right" : "left",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
      }}
    >
      <Typography noWrap>{product.title}</Typography>
      <Price amount={product.unitAmount} />
    </Box>

    <Box
      sx={{
        width: "5.5rem", // fixed width ~88px
        textAlign: localeCache.isRtl() ? "right" : "left",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: localeCache.isRtl() ? "flex-start" : "flex-end",
      }}
    >
      <Typography fontWeight="bold" fontSize="1.2rem">
        <Price amount={product.totalAmount} />
      </Typography>
      <Typography variant="body2">
        <FormattedMessage
          id="checkout.quantity"
          values={{ quantity: product.quantity }}
        />
      </Typography>
    </Box>
  </Grid>
);
export default function CheckoutSummary() {
  const cart: Cart = useAppSelector((state) => state.cart);
  return (
    <Box
      sx={{
        width: "100%",
        mx: "auto",
        p: 2,
        display: "flex",
        flexDirection: "column",
        gap: 2,
      }}
    >
      <Typography variant="h4" textAlign="center" fontWeight="bold" mb={2}>
        <FormattedMessage id="checkout.summary.title" />
      </Typography>

      {cart?.lines.length ? (
        cart.lines.map((product: CartItem) => (
          <CheckoutSummaryItem key={product.productId} product={product} />
        ))
      ) : (
        <Typography textAlign="center" color="text.secondary">
          <FormattedMessage id="checkout.empty" />
        </Typography>
      )}

      <Divider />

      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          gap: 1,
          direction: localeCache.dir(),
        }}
      >
        <Typography variant="h6" fontWeight="bold">
          <FormattedMessage id="checkout.total" />
        </Typography>
        <Typography variant="h6" fontWeight="bold">
          <Price amount={cart.cost} />
        </Typography>
      </Box>
    </Box>
  );
}
