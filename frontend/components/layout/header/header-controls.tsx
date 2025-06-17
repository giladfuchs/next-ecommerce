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
import Cart from "components/cart";
import AdminNav from "./admin-nav";

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
      fullWidth
      inputProps={{ "data-testid": "search-input" }}
      InputProps={{
        endAdornment: (
          <InputAdornment position="end">
            <SearchIcon className="text-gray-400" fontSize="small" />
          </InputAdornment>
        ),
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

export default function HeaderControls() {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith("/admin");

  const shouldShowSearch = pathname === "/" || pathname.startsWith("/category");

  if (isAdmin) return <AdminNav />;

  return (
    <>
      <div className="flex w-full md:w-1/3 justify-start px-2">
        <Box display="flex" gap={{ xs: 0, md: 2 }} alignItems="center">
          {shouldShowSearch && <Search />}
          <AuthButtons />
        </Box>
      </div>
      <div className="flex justify-end w-auto md:w-1/3">
        <Cart />
      </div>
    </>
  );
}
