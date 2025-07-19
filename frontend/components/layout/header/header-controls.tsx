"use client";
import { useState, useEffect, useRef } from "react";
import { useIntl, FormattedMessage } from "react-intl";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import {
  AdminPanelSettings as AdminPanelSettingsIcon,
  Logout as LogoutIcon,
  Search as SearchIcon,
} from "@mui/icons-material";
import {
  TextField,
  InputAdornment,
  Box,
  Tooltip,
  IconButton,
} from "@mui/material";
import Cart from "@/components/cart";
import AdminNav from "./admin-nav";
import { localeCache } from "@/lib/api";
import ProductGalleryClient from "@/components/products/single/product-gallery";

const Search = () => {
  const intl = useIntl();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [query, setQuery] = useState(searchParams.get("q") || "");
  const lastAppliedQuery = useRef(query);

  useEffect(() => {
    const timeout = setTimeout(() => {
      const trimmed = query.trim();
      if (trimmed === lastAppliedQuery.current) return;

      const params = new URLSearchParams(searchParams.toString());

      if (trimmed) {
        params.set("q", trimmed);
      } else {
        params.delete("q");
      }

      const newUrl = `${pathname}${params.toString() ? `?${params}` : ""}`;
      lastAppliedQuery.current = trimmed;
      router.replace(newUrl);
    }, 500);

    return () => clearTimeout(timeout);
  }, [query, pathname, router, searchParams]);

  return (
    <TextField
      value={query}
      onChange={(e) => setQuery(e.target.value)}
      placeholder={intl.formatMessage({ id: "search.placeholder" })}
      variant="outlined"
      size="small"
      slotProps={{
        input: {
          endAdornment: (
            <InputAdornment position={localeCache.isRtl() ? "start" : "end"}>
              <SearchIcon fontSize="small" />
            </InputAdornment>
          ),
          autoComplete: "off",
        },
      }}
    />
  );
};

const AuthButtons = () => {
  const intl = useIntl();
  const router = useRouter();
  const pathname = usePathname();
  const [hasToken, setHasToken] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const expiresAt = Number(localStorage.getItem("token_expires_at"));

    const isValid = token && Date.now() < expiresAt;

    if (!isValid) {
      localStorage.removeItem("token");
      localStorage.removeItem("token_expires_at");
    }

    setHasToken(!!isValid);
  }, [pathname]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("token_expires_at");
    toast.success(intl.formatMessage({ id: "logout.success" }));
    setHasToken(false);
    router.push("/");
  };

  if (!hasToken) return null;

  return (
    <>
      <Tooltip title={<FormattedMessage id="search.admin" />}>
        <IconButton
          color="primary"
          onClick={() => router.push("/admin")}
          size="large"
        >
          <AdminPanelSettingsIcon />
        </IconButton>
      </Tooltip>

      <Tooltip title={<FormattedMessage id="search.logout" />}>
        <IconButton color="error" onClick={handleLogout} size="large">
          <LogoutIcon />
        </IconButton>
      </Tooltip>
    </>
  );
};
export default function HeaderControlsClient() {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith("/admin");
  const shouldShowSearch = pathname === "/" || pathname.startsWith("/category");

  if (isAdmin) return <AdminNav />;

  return (
    <Box
      sx={{
        gap: "0.5rem",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        width: "100%",
      }}
    >

      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        <AuthButtons />
      </Box>

      {shouldShowSearch && (
        <Box sx={{ flexGrow: 1, display: "flex", justifyContent: "center" }}>
          <Box sx={{ maxWidth: "24rem", width: "100%" }}>
            <Search />
          </Box>
        </Box>
      )}

      <Box sx={{ display: "flex", alignItems: "center" }}>
        <Cart />
      </Box>
    </Box>
  );
}
