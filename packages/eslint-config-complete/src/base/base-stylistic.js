import esLintPluginStylistic from "@stylistic/eslint-plugin";
import { defineConfig } from "eslint/config";

/**
 * This ESLint config only contains rules from `@stylistic/eslint-plugin`:
 * https://eslint.style/
 */
export const baseStylistic = defineConfig({
  plugins: {
    "@stylistic": esLintPluginStylistic,
  },

  rules: {
    /** This rule is not handled by Prettier, so we must use ESLint to enforce it. */
    "@stylistic/lines-between-class-members": [
      "error",
      "always",
      {
        exceptAfterSingleLine: true,
      },
    ],

    /** Enforce a blank line between functions. (Prettier does not do this by default.) */
    "@stylistic/padding-line-between-statements": [
      "error",
      { blankLine: "always", prev: "function", next: "function" },
    ],

    /**
     * We forbid unnecessary backticks by using the options specified in [the
     * `eslint-config-prettier`
     * documentation](https://github.com/prettier/eslint-config-prettier#enforce-backticks).
     */
    "@stylistic/quotes": [
      "error",
      "double",
      {
        avoidEscape: true,
        allowTemplateLiterals: "never",
      },
    ],

    /**
     * Partially superseded by `complete/format-jsdoc-comments` and `complete/format-line-comments`,
     * but those rules do not handle trailing line comments.
     *
     * The `markers` option is provided to make this rule ignore lines that start with "///".
     */
    "@stylistic/spaced-comment": [
      "error",
      "always",
      {
        markers: ["/"],
      },
    ],
  },
});
