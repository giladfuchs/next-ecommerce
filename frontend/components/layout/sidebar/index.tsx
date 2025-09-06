import { ReactNode } from "react";
import { Box } from "@mui/material";
import Categories from "./categories";
import { Category } from "@/lib/types";

export default function SidebarLayout({
  children,
  categories,
  currentPath,
}: {
  currentPath?: string;
  children: ReactNode;
  categories: Category[];
}) {
  return (
    <Box
      sx={{
        maxWidth: "var(--breakpoint-2xl)",
        display: "flex",
        flexDirection: { xs: "column", md: "row" },
        alignItems: "flex-start",
      }}
    >
      <Box
        sx={{
          flexShrink: 0,
          width: { xs: "100%", md: "6rem" },
        }}
        data-testid="category-nav"
      >
        <Categories currentPath={currentPath} categories={categories} />
      </Box>

      <Box
        sx={{
          flexGrow: 1,
          width: "100%",
        }}
      >
        {children}
      </Box>
    </Box>
  );
}
