import js from "@eslint/js";
import globals from "globals";
import prettier from "eslint-plugin-prettier";
import eslintConfigPrettier from "eslint-config-prettier";
import { defineConfig } from "eslint/config";

export default defineConfig([
  js.configs.recommended,

  {
    ignores: [
      "node_modules",
      ".serverless",
      "coverage",
      ".env"
    ],

    files: ["**/*.js"],

    languageOptions: {
      sourceType: "commonjs", // for Node.js
      globals: globals.node
    },

    plugins: {
      prettier
    },

    rules: {
      "prettier/prettier": "error",
      semi: ["error", "always"],
      quotes: [
        "error",
        "single",
        {
          avoidEscape: true
        }
      ],
      curly: ["error", "all"],
      indent: ["error", 2],

      "no-console": "off",
      "no-unused-vars": [
        "warn",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_"
        }
      ]
    }
  },

  eslintConfigPrettier
]);