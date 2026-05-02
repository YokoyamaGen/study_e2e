import tsEslintParser from "@typescript-eslint/parser";
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
    plugins: { playwright },
    rules: {
      ...playwright.configs.recommended.rules,
    },
  },
]