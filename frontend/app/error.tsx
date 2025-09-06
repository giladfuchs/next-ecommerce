"use client";
import { Box, Typography, Button } from "@mui/material";
import { FormattedMessage } from "react-intl";

export default function Error({ reset }: { reset: () => void }) {
  return (
    <Box
      sx={{
        maxWidth: "48rem",
        margin: "2rem auto",
        padding: { xs: "2rem", md: "3rem" },
        borderRadius: "0.75rem",
        backgroundColor: "#fff",
        border: "1px solid #e5e5e5",
      }}
    >
      <Typography variant="h2" fontSize="1.4rem" fontWeight="bold" gutterBottom>
        <FormattedMessage id="errorPage.title" />
      </Typography>

      <Typography fontSize="1rem" lineHeight={1.6} mb="1.5rem">
        <FormattedMessage id="errorPage.message" />
      </Typography>

      <Button
        onClick={reset}
        variant="contained"
        sx={{
          fontSize: "1rem",
          padding: "1rem 1.5rem",
          borderRadius: "9999px",
          textTransform: "none",
          fontWeight: 600,
          display: "block",
          width: "100%",
          margin: "0 auto",
        }}
      >
        <FormattedMessage id="errorPage.retry" />
      </Button>
    </Box>
  );
}
