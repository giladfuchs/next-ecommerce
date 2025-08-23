import { Box } from "@mui/material";
import { ReactNode } from "react";

export default function ProductsGrid({ children }: { children: ReactNode }) {
  return (
    <Box
      data-testid="product-list"
      component="ul"
      sx={{
        display: "grid",
        gap: "1rem",
        gridTemplateColumns: {
          xs: "repeat(1, minmax(0, 1fr))",
          sm: "repeat(2, minmax(0, 1fr))",
          lg: "repeat(3, minmax(0, 1fr))",
        },
        listStyle: "none",
        px: 2,
        mx: "auto",
        width: { xs: "90%", md: "80%" },
      }}
    >
      {children}
    </Box>
  );
}
export function ProductItem({ children }: { children: ReactNode }) {
  return (
    <Box
      component="li"
      sx={{
        aspectRatio: "1 / 1",
        width: "95%",

        boxSizing: "border-box",
        overflow: "hidden",
        animation: "fadeIn 0.4s ease",
      }}
    >
      {children}
    </Box>
  );
}
