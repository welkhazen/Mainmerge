import js from "@eslint/js";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import tseslint from "typescript-eslint";

export default tseslint.config(
  { ignores: ["dist"] },
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    plugins: {
      "react-hooks": reactHooks,
      "react-refresh": reactRefresh,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      "react-refresh/only-export-components": ["warn", { allowConstantExport: true }],
      "@typescript-eslint/no-unused-vars": "off",
      "no-restricted-syntax": [
        "error",
        {
          selector:
            "CallExpression[callee.object.name='posthog'][callee.property.name='capture']",
          message:
            "Do not call posthog.capture directly. Import `track` from '@/lib/analytics' instead.",
        },
        {
          selector:
            "CallExpression[callee.property.name='capture'][callee.object.type='Identifier'][callee.object.name=/^ph|posthog$/]",
          message:
            "Do not call posthog.capture directly. Import `track` from '@/lib/analytics' instead.",
        },
      ],
    },
  },
  {
    files: ["src/lib/analytics/**/*.{ts,tsx}", "src/components/analytics/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-syntax": "off",
    },
  },
);
