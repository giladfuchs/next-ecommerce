"use client";

import { Toaster } from "sonner";

import { useTheme } from "@/lib/providers/theme";

export const SonnerProvider = () => {
  const { theme } = useTheme();

  return (
    <Toaster
      richColors
      closeButton
      position="bottom-center"
      theme={theme || "light"}
    />
  );
};
