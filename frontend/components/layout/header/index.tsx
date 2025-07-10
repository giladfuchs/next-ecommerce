"use client";

import Link from "next/link";
import { Box, Container } from "@mui/material";
import { HeaderControls } from "components/shared/wrappers";
import Logo from "components/layout/header/logo";

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
      <Container
        maxWidth={false}
        sx={{
          maxWidth: "1536px",
          px: { xs: 0, sm: "1.5rem" },
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
      </Container>
    </Box>
  );
}
