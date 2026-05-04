import tsEslintParser from "@typescript-eslint/parser";
import tsEslintPlugin from "@typescript-eslint/eslint-plugin";
import playwright from "eslint-plugin-playwright";

export default [
  {
    files: ['tests/**/*.ts', 'tests/**/*.js'],
    languageOptions: {
      parser: tsEslintParser,
      parserOptions: {
        project: "./tsconfig.json",
      },
    },
    plugins: { playwright, "@typescript-eslint": tsEslintPlugin },
    rules: {
      ...playwright.configs.recommended.rules,
      "no-console": "error",
      "@typescript-eslint/no-unused-vars": ["error", { vars: "all", args: "after-used", ignoreRestSiblings: true }],
      "no-unreachable": "error",
      "no-unreachable-loop": "error",
    },
  },
]