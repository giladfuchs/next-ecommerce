"use client";
import { Grid } from "@mui/material";
import CheckoutForm from "./checkout-form";
import CheckoutSummary from "./checkout-summary";
import { OrderErrorMessage } from "@/components/shared/messages";

export default function CheckoutLayout({
  onSuccess,
  onError,
  orderError,
}: {
  onSuccess: (id: number) => void;
  onError: () => void;
  orderError: boolean;
}) {
  return (
    <Grid
      data-testid="checkout-form-grid"
      container
      spacing={4}
      justifyContent="center"
      alignItems="flex-start"
      sx={{ minHeight: "100vh", px: 2 }}
    >
      <Grid size={{ xs: 12, md: 7 }} sx={{ order: { xs: 1, md: 2 } }}>
        <CheckoutSummary />
      </Grid>
      <Grid size={{ xs: 12, md: 5 }} sx={{ order: { xs: 2, md: 1 } }}>
        {orderError && <OrderErrorMessage />}
        <CheckoutForm onSuccess={onSuccess} onError={onError} />
      </Grid>
    </Grid>
  );
}
