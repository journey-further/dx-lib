import { fixupConfigRules } from "@eslint/compat";
import base from "eslint-config-jf-base";
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
  ...fixupConfigRules(compat.extends("plugin:import-x/recommended", "plugin:import-x/typescript")),
  jsdoc.configs["flat/recommended"],
  ...tseslint.configs.recommended,
  ...base,
  {
    ignores: [
      "**/jest.config.ts",
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
        ...globals.jest,
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

      ecmaVersion: 2021,
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
      "no-promise-executor-return": "off",
      "@typescript-eslint/default-param-last": ["off"],
      "import/prefer-default-export": "off",
      "node/no-missing-import": "off",
      "import-x/no-unresolved": [2, { commonjs: true, amd: true }],
      "import/extensions": "off",
      "@typescript-eslint/no-misused-promises": [
        "error",
        {
          checksVoidReturn: false,
        },
      ],

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
      "prettier/prettier": "warn",
      "no-console": "off",
      "func-names": "off",
      "no-process-exit": "off",
      "object-shorthand": "off",
      "class-methods-use-this": "off",
      "node/no-unpublished-require": "off",
      "import/no-extraneous-dependencies": "off",
      "prefer-regex-literals": "off",
      "no-param-reassign": "off",
      "jsdoc/require-param-type": "off",
      "jsdoc/require-returns-type": "off",
      "jsdoc/require-returns": "off",
      "jsdoc/require-param": "off",
      "jsdoc/tag-lines": "off",
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
      "node/no-unpublished-import": "off",
      "no-continue": "off",
      "import/no-unresolved": "off",
      "spaced-comment": "off",

      "node/no-unsupported-features/es-syntax": [
        "error",
        {
          ignores: ["modules"],
        },
      ],
      "jsdoc/no-defaults": "off",
    },
  },
];
