// eslint.config.js
import tseslint from "@typescript-eslint/eslint-plugin";
import tsparser from "@typescript-eslint/parser";
import complexity from "eslint-plugin-complexity";

export default [
  {
    files: ["**/*.ts"],
    languageOptions: {
      parser: tsparser,
      parserOptions: {
        ecmaVersion: 2022,
        sourceType: "module",
      },
    },
    plugins: {
      "@typescript-eslint": tseslint,
      complexity,
    },
    rules: {
      "complexity": ["warn", 1],          // flag any function with CC > 1
      "@typescript-eslint/no-unused-vars": "off",
    },
  },
];