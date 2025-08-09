import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";
import unusedImports from "eslint-plugin-unused-imports";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  // Ignore generated artifacts and build outputs
  {
    ignores: ["generated/**", ".next/**", "node_modules/**"],
  },
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  // Plugin to auto-remove unused imports on --fix
  {
    plugins: {
      "unused-imports": unusedImports,
    },
    rules: {
      // This rule is fixable and will remove unused imports on --fix
      "unused-imports/no-unused-imports": "error",
    },
  },
  // Apply overrides for TypeScript files explicitly to ensure they take precedence
  {
    files: ["**/*.ts", "**/*.tsx"],
    rules: {
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-unused-vars": [
        "warn",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          ignoreRestSiblings: true,
        },
      ],
    },
  },
  {
    // Let TS plugin handle unused vars
    rules: {
      "no-unused-vars": "off",
    },
  },
];

export default eslintConfig;
