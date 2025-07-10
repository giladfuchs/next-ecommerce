"use client";
import Link from "next/link";
import { Box, Typography } from "@mui/material";
import { FormattedMessage } from "react-intl";

export default function NotFound() {
  return (
    <Box
      minHeight="100vh"
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      px={2}
    >
      <Typography
        variant="h1"
        fontSize="2rem"
        fontWeight="bold"
        mb="1.5rem"
        textAlign="center"
      >
        <FormattedMessage id="notFound.title" />
      </Typography>

      <Typography
        fontSize="1.2rem"
        mb="2rem"
        textAlign="center"
        maxWidth="40rem"
      >
        <FormattedMessage id="notFound.description" />
      </Typography>

      <Typography
        component={Link}
        href="/"
        fontSize="1rem"
        color="primary"
        sx={{ textDecoration: "underline" }}
      >
        <FormattedMessage id="notFound.backHome" />
      </Typography>
    </Box>
  );
}
