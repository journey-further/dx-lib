import { fixupConfigRules, fixupPluginRules } from "@eslint/compat";
import prettier from "eslint-plugin-prettier";
import _import from "eslint-plugin-import";
import typescriptEslint from "@typescript-eslint/eslint-plugin";
import jsdoc from "eslint-plugin-jsdoc";
import globals from "globals";
import path from "node:path";
import { fileURLToPath } from "node:url";
import js from "@eslint/js";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const compat = new FlatCompat({
    baseDirectory: __dirname,
    recommendedConfig: js.configs.recommended,
    allConfig: js.configs.all
});

export default [{
    ignores: [
        "**/jest.config.ts",
        "**/__tests__",
        "**/dist",
        "**/rollup.config.ts",
        "**/docs",
        "**/replacer.cjs",
        "**/coverage",
    ],
}, ...fixupConfigRules(compat.extends(
    "airbnb-base",
    "airbnb-typescript/base",
    "prettier",
    "eslint:recommended",
    "plugin:import/typescript",
    "plugin:import/recommended",
    "plugin:node/recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:@typescript-eslint/recommended-requiring-type-checking",
    "plugin:jsdoc/recommended",
)), {
    plugins: {
        prettier,
        import: fixupPluginRules(_import),
        "@typescript-eslint": fixupPluginRules(typescriptEslint),
        jsdoc: fixupPluginRules(jsdoc),
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
            jfExperiment: true,
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

        node: {
            tryExtensions: [".ts"],
        },
    },

    rules: {
        "no-promise-executor-return": "off",
        "@typescript-eslint/default-param-last": ["off"],
        "import/prefer-default-export": "off",
        "node/no-missing-import": "off",
        "@typescript-eslint/naming-convention": "off",

        "@typescript-eslint/no-misused-promises": ["error", {
            checksVoidReturn: false,
        }],

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
        eqeqeq: "off",
        "no-underscore-dangle": "warn",
        "no-restricted-syntax": "off",
        "no-await-in-loop": "off",

        "no-plusplus": ["warn", {
            allowForLoopAfterthoughts: true,
        }],

        "node/no-unpublished-import": "off",
        "no-continue": "off",
        "import/no-unresolved": "off",
        "spaced-comment": "off",

        "node/no-unsupported-features/es-syntax": ["error", {
            ignores: ["modules"],
        }],
    },
}];