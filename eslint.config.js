const globals = require("globals");
const reactHooks = require("eslint-plugin-react-hooks");
const reactRefreshPackage = require("eslint-plugin-react-refresh");
const reactRefresh = reactRefreshPackage.default ?? reactRefreshPackage;
const tseslint = require("typescript-eslint");
const prettier = require("eslint-config-prettier");

module.exports = tseslint.config(
  {
    ignores: [
      "**/node_modules/**",
      "**/dist/**",
      "**/build/**",
      "coverage/**",
      "client/vite.config.ts",
    ],
  },
  {
    files: ["client/**/*.{ts,tsx}"],
    extends: [...tseslint.configs.recommended],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
      parserOptions: {
        project: ["./client/tsconfig.app.json"],
        tsconfigRootDir: __dirname,
      },
    },
    plugins: {
      "react-hooks": reactHooks,
      "react-refresh": reactRefresh,
    },
    rules: {
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "warn",
      "react-refresh/only-export-components": [
        "warn",
        { allowConstantExport: true },
      ],
    },
  },
  {
    files: ["client/vite.config.ts"],
    extends: [...tseslint.configs.recommended],
    languageOptions: {
      globals: globals.node,
      parserOptions: {
        project: ["./client/tsconfig.node.json"],
        tsconfigRootDir: __dirname,
      },
    },
  },
  {
    files: ["server/**/*.ts"],
    extends: [...tseslint.configs.recommended],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.node,
      parserOptions: {
        project: ["./server/tsconfig.json"],
        tsconfigRootDir: __dirname,
      },
    },
  },
  prettier,
);
