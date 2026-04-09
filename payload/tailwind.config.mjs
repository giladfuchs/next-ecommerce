import plugin from "tailwindcss/plugin";
import typography from "@tailwindcss/typography";

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],

  darkMode: ["selector", '[data-theme="dark"]'],

  theme: {
    extend: {
      colors: {
        background: "oklch(var(--background) / <alpha-value>)",
        foreground: "oklch(var(--foreground) / <alpha-value>)",
        border: "oklch(var(--border) / <alpha-value>)",
        ring: "oklch(var(--ring) / <alpha-value>)",
        success: "oklch(var(--success) / <alpha-value>)",
        warning: "oklch(var(--warning) / <alpha-value>)",
        error: "oklch(var(--error) / <alpha-value>)",
      },
    },
  },

  plugins: [
    typography,
    plugin(({ matchUtilities, theme }) => {
      matchUtilities(
        { "animation-delay": (value) => ({ animationDelay: value }) },
        { values: theme("transitionDelay") },
      );
    }),
  ],
};
