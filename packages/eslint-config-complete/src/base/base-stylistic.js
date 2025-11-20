import ESLintPluginStylistic from "@stylistic/eslint-plugin";
import { defineConfig } from "eslint/config";

/**
 * This ESLint config only contains rules from `@stylistic/eslint-plugin`:
 * https://eslint.style/
 */
export const baseStylistic = defineConfig({
  plugins: {
    "@stylistic": ESLintPluginStylistic,
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
