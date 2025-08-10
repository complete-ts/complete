// @ts-check

import ESLintPluginESLintPlugin from "eslint-plugin-eslint-plugin";
import tseslint from "typescript-eslint";
import { completeConfigBase } from "../eslint-config-complete/src/base.js";

export default tseslint.config(
  ...completeConfigBase,

  // Enable "eslint-plugin-eslint-plugin."
  {
    plugins: {
      "eslint-plugin": ESLintPluginESLintPlugin,
    },

    rules: {
      "eslint-plugin/consistent-output": "warn",
      "eslint-plugin/fixer-return": "warn",
      "eslint-plugin/meta-property-ordering": "warn",
      "eslint-plugin/no-deprecated-context-methods": "warn",
      "eslint-plugin/no-deprecated-report-api": "warn",
      "eslint-plugin/no-identical-tests": "warn",
      "eslint-plugin/no-meta-replaced-by": "warn",
      "eslint-plugin/no-meta-schema-default": "warn",
      "eslint-plugin/no-missing-message-ids": "warn",
      "eslint-plugin/no-missing-placeholders": "warn",
      "eslint-plugin/no-only-tests": "warn",
      "eslint-plugin/no-property-in-node": "warn",
      "eslint-plugin/no-unused-message-ids": "warn",
      "eslint-plugin/no-unused-placeholders": "warn",
      "eslint-plugin/no-useless-token-range": "warn",
      "eslint-plugin/prefer-message-ids": "warn",
      "eslint-plugin/prefer-object-rule": "warn",
      "eslint-plugin/prefer-output-null": "warn",
      "eslint-plugin/prefer-placeholders": "warn",
      "eslint-plugin/prefer-replace-text": "warn",
      "eslint-plugin/report-message-format": "warn",

      /**
       * TODO: Enable this rule.
       *
       * @see https://github.com/eslint-community/eslint-plugin-eslint-plugin/issues/545
       */
      "eslint-plugin/require-meta-default-options": "off",

      /**
       * TODO: Remove these options.
       *
       * @see https://github.com/eslint-community/eslint-plugin-eslint-plugin/pull/495
       */
      "eslint-plugin/require-meta-docs-description": [
        "warn",
        {
          pattern: "^(Enforce|Require|Disallow)",
        },
      ],

      "eslint-plugin/require-meta-docs-recommended": "warn",

      /** Disabled since this is automatically handled by the `createRule` helper function. */
      "eslint-plugin/require-meta-docs-url": "off",

      "eslint-plugin/require-meta-fixable": "warn",
      "eslint-plugin/require-meta-has-suggestions": "warn",
      "eslint-plugin/require-meta-schema": "warn",
      "eslint-plugin/require-meta-schema-description": "warn",
      "eslint-plugin/require-meta-type": "warn",
      "eslint-plugin/test-case-property-ordering": "warn",
      "eslint-plugin/test-case-shorthand-strings": "warn",
    },
  },

  {
    rules: {
      /** This rule conflicts with this plugin's testing style. */
      "unicorn/prefer-single-call": "off",

      /** Some rules use bitwise operators to deal with TypeScript bit flags. */
      "no-bitwise": "off",

      /** We commonly trim incoming text. */
      "no-param-reassign": "off",
    },
  },

  {
    files: ["src/template.ts", "tests/template.ts", "tests/fixtures/file.ts"],
    rules: {
      "unicorn/no-empty-file": "off",
    },
  },
);
