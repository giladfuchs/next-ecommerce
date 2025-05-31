"use client";
import { useState } from "react";
import { Container } from "@mui/material";
import CheckoutLayout from "frontend/components/checkout";
import { OrderSuccessMessage } from "frontend/components/shared/messages";

export default function CheckoutPage() {
  const [orderSuccess, setOrderSuccess] = useState<number | null>(null);
  const [orderError, setOrderError] = useState(false);

  return (
    <Container
      maxWidth="lg"
      disableGutters
      sx={{ py: 4, px: 2, overflowX: "hidden" }}
    >
      {orderSuccess ? (
        <OrderSuccessMessage orderId={orderSuccess} />
      ) : (
        <CheckoutLayout
          onSuccess={(id) => setOrderSuccess(id)}
          onError={() => setOrderError(true)}
          orderError={orderError}
        />
      )}
    </Container>
  );
}
