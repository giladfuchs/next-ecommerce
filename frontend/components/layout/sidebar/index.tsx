import { ReactNode } from "react";
import { Box } from "@mui/material";
import Categories from "./categories";
import { Category } from "lib/types";

export default function SidebarLayout({
                                          children,
                                          categories,
                                          currentPath
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
                gap: 8,
                px: 4,
                pb: 4,
                mx: "auto",
                color: "text.primary",
            }}
        >
            <Box
                sx={{ order: { xs: 0, md: 0 }, flex: "none", width: "100%", maxWidth: { md: 125 } }}
                data-testid="category-nav"
            >
                <Categories currentPath={currentPath} categories={categories} />
            </Box>
            <Box sx={{ order: { xs: 1, md: 0 }, width: "100%", minHeight: "100vh" }}>
                {children}
            </Box>
        </Box>
    );
}