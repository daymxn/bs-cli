/**
 * @license
 * Copyright 2024 Daymon Littrell-Reyes
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import eslint from "@eslint/js";
import headers from "eslint-plugin-headers";
import eslintPluginPrettierRecommended from "eslint-plugin-prettier/recommended";
import eslintPluginUnicorn from "eslint-plugin-unicorn";
import tseslint from "typescript-eslint";

export default tseslint.config(
  eslint.configs.recommended,
  tseslint.configs.recommended,
  eslintPluginUnicorn.configs["flat/recommended"],
  eslintPluginPrettierRecommended,
  {
    plugins: {
      headers,
    },
    rules: {
      camelcase: "off",
      "headers/header-format": [
        "error",
        {
          path: "static/license-header.txt",
          source: "file",
          trailingNewlines: 2,
          variables: {
            name: "Daymon Littrell-Reyes",
            year: "2024",
          },
        },
      ],
      "max-params": "off",
      "new-cap": "off",
      "no-return-assign": "off",
      "prettier/prettier": [
        "warn",
        {
          arrowParens: "always",
          bracketSpacing: true,
          endOfLine: "lf",
          plugins: ["prettier-plugin-organize-imports"],
          printWidth: 120,
          semi: true,
          singleQuote: false,
          tabWidth: 2,
          trailingComma: "all",
          useTabs: false,
        },
      ],
    },
  },
  {
    rules: {
      "@typescript-eslint/adjacent-overload-signatures": "warn",
      "@typescript-eslint/explicit-function-return-type": "off",
      "@typescript-eslint/no-empty-function": "warn",
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/no-namespace": "off",
      "@typescript-eslint/no-non-null-assertion": "off",
      "@typescript-eslint/no-unused-vars": [
        "warn",
        {
          ignoreRestSiblings: true,
          argsIgnorePattern: "^_",
        },
      ],
    },
  },
  {
    rules: {
      "unicorn/catch-error-name": [
        "warn",
        {
          name: "e",
        },
      ],
      "unicorn/consistent-destructuring": "warn",
      "unicorn/no-array-callback-reference": "off",
      "unicorn/no-array-reduce": "off",
      "unicorn/no-empty-file": "warn",
      "unicorn/no-useless-undefined": "off",
      "unicorn/prefer-string-slice": "off",
      "unicorn/prevent-abbreviations": "off",
    },
  },
  {
    ignores: ["out", "**/dist", "bin"],
  },
  {
    languageOptions: {
      parserOptions: {
        ecmaFeatures: { jsx: true },
        projectService: {
          allowDefaultProject: ["*.js", "*.mjs", "*.ts"],
          defaultProject: "tsconfig.json",
        },
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
);
