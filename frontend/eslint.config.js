import js from "@eslint/js";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";
import tseslint from "typescript-eslint";
import unusedImports from "eslint-plugin-unused-imports";
import importPlugin from "eslint-plugin-import";
import nextPlugin from "@next/eslint-plugin-next";
import { globalIgnores } from "eslint/config";

export default tseslint.config([
  globalIgnores([".next", "dist", "node_modules", "coverage"]),
  { ignores: ["**/*.generated.*", "**/*.gen.*"] },

  {
    files: ["**/*.{ts,tsx}"],

    extends: [
      js.configs.recommended,
      ...tseslint.configs.recommended,
      importPlugin.flatConfigs.recommended,
      importPlugin.flatConfigs.typescript,
      nextPlugin.configs["core-web-vitals"],
    ],

    languageOptions: {
      ecmaVersion: 2024,
      sourceType: "module",
      globals: globals.browser,
    },

    plugins: {
      "react-hooks": reactHooks,
      "unused-imports": unusedImports,
    },

    settings: {
      "import/resolver": {
        typescript: { project: ["./tsconfig.json"] },
        node: true,
      },
    },

    rules: {
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "warn",
      "unused-imports/no-unused-imports": "error",
      "unused-imports/no-unused-vars": [
        "error",
        { varsIgnorePattern: "^_", argsIgnorePattern: "^_" },
      ],
      "@typescript-eslint/no-unused-vars": [
        "error",
        { varsIgnorePattern: "^_", argsIgnorePattern: "^_" },
      ],
      "@typescript-eslint/no-require-imports": "error",
      "import/order": [
        "warn",
        {
          groups: [
            "builtin",
            "external",
            "internal",
            "parent",
            "sibling",
            "index",
            "object",
            "type",
          ],
          "newlines-between": "always",
          alphabetize: { order: "asc", caseInsensitive: true },
        },
      ],
    },
  },

  {
    files: ["next-env.d.ts"],
    rules: { "@typescript-eslint/triple-slash-reference": "off" },
  },
]);
