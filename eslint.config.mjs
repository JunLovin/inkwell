import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";
import js from "@eslint/js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
});

const eslintConfig = [
  {
    ignores: [
      ".next/**",
      "out/**",
      "build/**",
      "node_modules/**",
      "convex/_generated/**",
    ],
  },

  ...compat.config({
    extends: ["next/core-web-vitals", "next/typescript"],
  }),

  {
    rules: {
      "no-console": ["warn", { allow: ["warn", "error"] }],
      "@typescript-eslint/no-unused-vars": ["error", { "argsIgnorePattern": "^_" }],
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "warn",
    },
  },
];

export default eslintConfig;
