import { fixupConfigRules } from "@eslint/compat";
import jsdoc from "eslint-plugin-jsdoc";
import globals from "globals";
import tseslint from "typescript-eslint";
import path from "node:path";
import { fileURLToPath } from "node:url";
import js from "@eslint/js";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
  allConfig: js.configs.all,
});

export default [
  js.configs.recommended,
  ...fixupConfigRules(compat.extends("plugin:import-x/recommended", "plugin:import-x/typescript")),
  jsdoc.configs["flat/recommended"],
  ...tseslint.configs.recommended,
  {
    ignores: [
      "**/vitest.config.ts",
      "**/__tests__",
      "**/dist",
      "**/rollup.config.ts",
      "**/docs",
      "**/replacer.cjs",
      "**/coverage",
    ],
  },
  {
    plugins: {
      jsdoc,
    },

    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
        Test: true,
        jQuery: true,
        $: true,
        moment: true,
        SS: true,
        Config: true,
        WT: true,
        ready: true,
        dataLayer: true,
        Trustpilot: true,
        __NEXT_DATA__: true,
        SCADataLayer: true,
        require: true,
        Glide: true,
        Shopify: true,
      },

      ecmaVersion: 2022,
      sourceType: "module",

      parserOptions: {
        project: "tsconfig.json",
        parser: "@typescript-eslint/parser",
      },
    },

    settings: {
      "import/parsers": {
        "@typescript-eslint/parser": [".ts", ".d.ts"],
      },

      "import/resolver": {
        typescript: {
          alwaysTryTypes: true,
          project: "tsconfig.json",
        },
      },

      "import-x/resolver": {
        typescript: true,
        node: true,
      },

      node: {
        tryExtensions: [".ts"],
      },
    },

    rules: {
      // Core rules
      "no-promise-executor-return": "off",
      "no-restricted-imports": ["error", "waitFor"],
      semi: "warn",
      "no-undef": "error",
      "no-mixed-spaces-and-tabs": "off",
      "no-use-before-define": "off",
      "no-empty": "warn",
      "no-extra-boolean-cast": "off",
      camelcase: "off",
      "prefer-const": "warn",
      "prefer-arrow-callback": "warn",
      quotes: "off",
      "vars-on-top": "off",
      "no-console": "off",
      "func-names": "off",
      "no-process-exit": "off",
      "object-shorthand": "off",
      "class-methods-use-this": "off",
      "prefer-regex-literals": "off",
      "no-param-reassign": "off",
      eqeqeq: "off",
      "no-underscore-dangle": "warn",
      "no-restricted-syntax": "off",
      "no-await-in-loop": "off",
      "no-unused-vars": "off",
      "no-plusplus": [
        "warn",
        {
          allowForLoopAfterthoughts: true,
        },
      ],
      "default-param-last": "off",
      "no-continue": "off",
      "spaced-comment": "off",

      // TypeScript rules
      "@typescript-eslint/default-param-last": ["off"],
      "@typescript-eslint/no-misused-promises": [
        "error",
        {
          checksVoidReturn: false,
        },
      ],
      "@typescript-eslint/no-unsafe-function-type": "off",
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/no-unused-vars": ["warn", { argsIgnorePattern: "^_", varsIgnorePattern: "^_" }],

      // Import rules
      "import/prefer-default-export": "off",
      "import/extensions": "off",
      "import/no-extraneous-dependencies": "off",
      "import/no-unresolved": "off",
      "import-x/no-unresolved": [2, { commonjs: true, amd: true }],
      "node/no-missing-import": "off",
      "node/no-unpublished-require": "off",
      "node/no-unpublished-import": "off",
      "node/no-unsupported-features/es-syntax": [
        "error",
        {
          ignores: ["modules"],
        },
      ],

      // JSDoc rules
      "jsdoc/require-param-type": "off",
      "jsdoc/require-returns-type": "off",
      "jsdoc/require-returns": "off",
      "jsdoc/require-param": "off",
      "jsdoc/tag-lines": "off",
      "jsdoc/no-defaults": "off",
    },
  },
];
