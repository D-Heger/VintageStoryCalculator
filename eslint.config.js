import js from "@eslint/js";
import tseslint from "typescript-eslint";
import globals from "globals";

export default tseslint.config(
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals: globals.browser
    }
  },
  {
    files: ["*.config.js"],
    languageOptions: {
      globals: globals.node
    }
  },
  {
    ignores: ["dist/"]
  }
);
