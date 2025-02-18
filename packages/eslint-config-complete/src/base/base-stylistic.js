import ESLintPluginStylistic from "@stylistic/eslint-plugin";
import tseslint from "typescript-eslint";

/**
 * This ESLint config only contains rules from `@stylistic/eslint-plugin`:
 * https://eslint.style/
 */
export const baseStylistic = tseslint.config({
  plugins: {
    "@stylistic": ESLintPluginStylistic,
  },

  rules: {
    /** This rule is not handled by Prettier, so we must use ESLint to enforce it. */
    "@stylistic/lines-between-class-members": [
      "warn",
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
      "warn",
      "double",
      {
        avoidEscape: true,
        allowTemplateLiterals: false,
      },
    ],

    /**
     * Partially superseded by `complete/format-jsdoc-comments` and `complete/format-line-comments`,
     * but those rules do not handle trailing line comments.
     *
     * The `markers` option is provided to make this rule ignore lines that start with "///".
     */
    "@stylistic/spaced-comment": [
      "warn",
      "always",
      {
        markers: ["/"],
      },
    ],
  },
});
