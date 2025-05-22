"use client";
import { Grid, Container, Typography } from "@mui/material";
import CheckoutInfo from "../../components/checkout/CheckoutInfo";
import CheckoutSummary from "../../components/checkout/CheckoutSummary";
import { useState } from "react";
import { FormattedMessage } from "react-intl";

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
        <>
          <Typography
            data-testid="checkout-success"
            variant="h5"
            textAlign="center"
            fontWeight="bold"
            color="success.main"
            mb={1}
          >
            <FormattedMessage id="checkout.success" />
          </Typography>
          <Typography
            variant="h6"
            textAlign="center"
            fontWeight="bold"
            color="success.main"
          >
            <FormattedMessage
              id="checkout.orderId"
              values={{ id: orderSuccess }}
            />
          </Typography>
          <Typography
            variant="subtitle1"
            textAlign="center"
            fontWeight="bold"
            color="success.main"
          >
            <FormattedMessage id="checkout.email_spam1" />
          </Typography>{" "}
          <Typography
            variant="subtitle1"
            textAlign="center"
            fontWeight="bold"
            color="success.main"
          >
            <FormattedMessage id="checkout.email_spam2" />
          </Typography>
        </>
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
            {orderError && (
              <Typography
                variant="h6"
                textAlign="center"
                fontWeight="bold"
                color="error"
                sx={{ py: 4 }}
              >
                <FormattedMessage id="checkout.error" />
              </Typography>
            )}
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
