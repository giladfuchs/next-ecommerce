"use client";

import { Box } from "@mui/material";
import Link from "next/link";

import Logo from "@/components/layout/header/logo";
import { HeaderControls } from "@/components/shared/wrappers";

export default function Header() {
  return (
    <Box
      component="nav"
      sx={{
        position: "sticky",
        top: 0,
        zIndex: 50,
        mb: 0.5,
        width: "100%",
        bgcolor: "var(--color-bg)",
        color: "var(--color-text)",
        borderBottom: "1px solid var(--color-border)",
      }}
    >
      <Box
        sx={{
          gap: "0.5rem",
          mx: "auto",
          width: "100%",
          maxWidth: "75rem",
          height: "4rem",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Link
          href="/"
          prefetch
          data-testid="site-logo"
          style={{
            display: "flex",
            alignItems: "center",
            textDecoration: "none",
          }}
        >
          <Logo />
        </Link>

        <HeaderControls />
      </Box>
    </Box>
  );
}
