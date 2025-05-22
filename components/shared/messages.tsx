"use client";

import { Typography } from "@mui/material";
import { FormattedMessage } from "react-intl";

export function SearchResultsMessage({ count }: { count: number }) {
  return (
    <Typography
      variant="h5"
      textAlign="center"
      fontWeight="bold"
      mb={2}
      color="black"
    >
      <FormattedMessage
        id="category.searchResults"
        defaultMessage="{count} products found"
        values={{ count }}
      />
    </Typography>
  );
}

export function NoProductsMessage() {
  return (
    <Typography textAlign="center" mt={3} color="text.secondary">
      <FormattedMessage
        id="category.noProducts"
        defaultMessage="No products found"
      />
    </Typography>
  );
}
