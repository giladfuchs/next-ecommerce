"use client";

import { createTheme, ThemeProvider } from "@mui/material/styles";
import { ReactNode } from "react";
import { localeCache } from "../api";

const theme = createTheme({
  direction: localeCache.dir(),
  palette: {
    primary: {
      main: "#24bfa7",
    },
    secondary: {
      main: "#5262cb",
    },
    warning: {
      main: "#ff9800",
      contrastText: "#fff",
    },
    error: {
      main: "#d32f2f",
      contrastText: "#fff",
    },
    background: {
      default: "#f4f9f8",
    },
  },
  shape: {
    borderRadius: 8,
  },
  typography: {
    fontSize: 16,
    fontFamily: "inherit",
  },
  components: {
    MuiTextField: {
      styleOverrides: {
        root: {
          "& .MuiOutlinedInput-root": {
            borderRadius: 8,
            backgroundColor: "#fff",
            "& fieldset": {
              borderColor: "#ddd",
            },
            "&:hover fieldset": {
              borderColor: "#aaa",
            },
            "&.Mui-focused fieldset": {
              borderColor: "#24bfa7",
              borderWidth: 1,
            },
          },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: "none",
          fontWeight: 500,
          fontSize: "1em",
          fontFamily: "inherit",
          paddingTop: "0.75em",
          paddingBottom: "0.75em",
          boxShadow: "none",
          border: "1px solid #ddd",
          transition: "all 0.2s",

          "&.MuiButton-containedPrimary": {
            backgroundColor: "var(--color-accent)",
            "&:hover": {
              backgroundColor: "var(--color-accent)",
            },
          },

          "&.underline-links": {
            textDecoration: "underline",
          },

          "@media (prefers-contrast: more)": {
            color: "yellow",
            borderColor: "yellow",
          },
        },
      },
    },
  },
});

export default function ThemeProviderLayout({ children }: { children: ReactNode }) {
  return <ThemeProvider theme={theme}>{children}</ThemeProvider>;
}
