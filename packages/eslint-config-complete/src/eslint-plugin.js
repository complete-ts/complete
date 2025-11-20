import ESLintPluginESLintPlugin from "eslint-plugin-eslint-plugin";
import { defineConfig } from "eslint/config";

/**
 * This ESLint config is meant to be used as a base for all TypeScript projects.
 *
 * Rule modifications are split out into different files for better organization (based on the
 * originating plugin) .
 */
export const completeConfigESLintPlugin = defineConfig({
  plugins: {
    "eslint-plugin": ESLintPluginESLintPlugin,
  },

  rules: {
    "eslint-plugin/consistent-output": "error",
    "eslint-plugin/fixer-return": "error",
    "eslint-plugin/meta-property-ordering": "error",
    "eslint-plugin/no-deprecated-context-methods": "error",
    "eslint-plugin/no-deprecated-report-api": "error",
    "eslint-plugin/no-identical-tests": "error",
    "eslint-plugin/no-meta-replaced-by": "error",
    "eslint-plugin/no-meta-schema-default": "error",
    "eslint-plugin/no-missing-message-ids": "error",
    "eslint-plugin/no-missing-placeholders": "error",
    "eslint-plugin/no-only-tests": "error",
    "eslint-plugin/no-property-in-node": "error",
    "eslint-plugin/no-unused-message-ids": "error",
    "eslint-plugin/no-unused-placeholders": "error",
    "eslint-plugin/no-useless-token-range": "error",
    "eslint-plugin/prefer-message-ids": "error",
    "eslint-plugin/prefer-object-rule": "error",
    "eslint-plugin/prefer-output-null": "error",
    "eslint-plugin/prefer-placeholders": "error",
    "eslint-plugin/prefer-replace-text": "error",
    "eslint-plugin/report-message-format": "error",

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
      "error",
      {
        pattern: "^(Enforce|Require|Disallow)",
      },
    ],

    "eslint-plugin/require-meta-docs-recommended": "error",

    /** Disabled since this is automatically handled by the `createRule` helper function. */
    "eslint-plugin/require-meta-docs-url": "off",

    "eslint-plugin/require-meta-fixable": "error",
    "eslint-plugin/require-meta-has-suggestions": "error",
    "eslint-plugin/require-meta-schema": "error",
    "eslint-plugin/require-meta-schema-description": "error",
    "eslint-plugin/require-meta-type": "error",
    "eslint-plugin/test-case-property-ordering": "error",
    "eslint-plugin/test-case-shorthand-strings": "error",
  },
});
