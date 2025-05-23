"use client";
import { useState } from "react";
import { Grid, Container } from "@mui/material";

import CheckoutInfo from "components/checkout/CheckoutInfo";
import CheckoutSummary from "components/checkout/CheckoutSummary";
import {
  OrderErrorMessage,
  OrderSuccessMessage,
} from "components/shared/OrderStatusChip";

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
        <Grid
          data-testid="checkout-form-grid"
          container
          spacing={4}
          justifyContent="center"
          alignItems="flex-start"
          sx={{ minHeight: "100vh", px: 2 }}
        >
          <Grid item xs={12} md={7} sx={{ order: { xs: 1, md: 2 } }}>
            <CheckoutSummary />
          </Grid>
          <Grid item xs={12} md={5} sx={{ order: { xs: 2, md: 1 } }}>
            {orderError && <OrderErrorMessage />}
            <CheckoutInfo
              onSuccess={(id) => setOrderSuccess(id)}
              onError={() => setOrderError(true)}
            />
          </Grid>
        </Grid>
      )}
    </Container>
  );
}
