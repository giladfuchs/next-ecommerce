"use client";

import { useCallback, useEffect, useState } from "react";

export const themeLocalStorageKey = "payload-theme";
export const defaultTheme: Theme = "light";

export type Theme = "dark" | "light";

export interface ThemeContextType {
  setTheme: (theme: Theme) => void;
  theme: Theme;
}

const isValidTheme = (value: string | null): value is Theme =>
  value === "dark" || value === "light";

const getStoredTheme = (): Theme => {
  try {
    const stored = localStorage.getItem(themeLocalStorageKey);
    return isValidTheme(stored) ? stored : defaultTheme;
  } catch {
    return defaultTheme;
  }
};

export const useTheme = (): ThemeContextType => {
  const [theme, setThemeState] = useState<Theme>(() => getStoredTheme());

  const setTheme = useCallback((next: Theme) => {
    localStorage.setItem(themeLocalStorageKey, next);
    document.documentElement.setAttribute("data-theme", next);
    setThemeState(next);
  }, []);

  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === themeLocalStorageKey) {
        const next = getStoredTheme();
        setThemeState(next);
        document.documentElement.setAttribute("data-theme", next);
      }
    };

    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  return { theme, setTheme };
};
