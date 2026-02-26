import nextPlugin from "@next/eslint-plugin-next";
import tseslint from "typescript-eslint";
import importPlugin from "eslint-plugin-import";
import unusedImports from "eslint-plugin-unused-imports";

export default [
  {
    ignores: [
      "**/node_modules/**",
      "**/.next/**",
      "**/dist/**",
      "**/build/**",
      "**/coverage/**",
      "**/public/**",
      "**/seed/**",
      "**/*.mjs",
      "**/next-env.d.ts",
      "**/postcss.config.js",
      "src/app/(payload)/**",
    ],
  },

  nextPlugin.configs["core-web-vitals"],
  ...tseslint.configs.recommended,

  {
    plugins: {
      import: importPlugin,
      "unused-imports": unusedImports,
    },

    rules: {
      "@typescript-eslint/ban-ts-comment": "warn",
      "@typescript-eslint/no-empty-object-type": "warn",
      "@typescript-eslint/no-explicit-any": "warn",

      "unused-imports/no-unused-imports": "warn",

      "unused-imports/no-unused-vars": [
        "warn",
        {
          vars: "all",
          varsIgnorePattern: "^_",
          args: "after-used",
          argsIgnorePattern: "^_",
          caughtErrorsIgnorePattern: "^(_|ignore)",
        },
      ],

      "import/order": [
        "warn",
        {
          groups: [
            "builtin",
            "external",
            "internal",
            ["parent", "sibling", "index"],
            "type",
          ],
          pathGroupsExcludedImportTypes: ["type"],

          alphabetize: { order: "asc", caseInsensitive: true },
          "newlines-between": "always",
        },
      ],

      "import/no-duplicates": "warn",
    },
  },
];
