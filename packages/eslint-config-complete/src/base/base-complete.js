import ESLintPluginComplete from "eslint-plugin-complete";
import tseslint from "typescript-eslint";

/**
 * This ESLint config only contains rules from `eslint-plugin-complete`:
 * https://complete-ts.github.io/eslint-plugin-complete
 */
export const baseComplete = tseslint.config(
  {
    plugins: {
      complete: ESLintPluginComplete,
    },

    rules: {
      "complete/complete-sentences-jsdoc": "warn",
      "complete/complete-sentences-line-comments": "warn",
      "complete/consistent-enum-values": "warn",
      "complete/consistent-named-tuples": "warn",
      "complete/eqeqeq-fix": "warn",
      "complete/format-jsdoc-comments": "warn",
      "complete/format-line-comments": "warn",
      "complete/jsdoc-code-block-language": "warn",
      "complete/newline-between-switch-case": "warn",
      "complete/no-confusing-set-methods": "warn",
      "complete/no-empty-jsdoc": "warn",
      "complete/no-empty-line-comments": "warn",
      "complete/no-explicit-array-loops": "warn",
      "complete/no-explicit-map-set-loops": "warn",
      "complete/no-for-in": "warn",
      "complete/no-let-any": "warn",
      "complete/no-mutable-return": "warn",
      "complete/no-number-enums": "warn",
      "complete/no-object-any": "warn",
      "complete/no-object-methods-with-map-set": "warn",
      "complete/no-string-length-0": "warn",
      "complete/no-template-curly-in-string-fix": "warn",
      "complete/no-undefined-return-type": "warn",
      "complete/no-unnecessary-assignment": "warn",
      "complete/no-unsafe-plusplus": "warn",
      "complete/no-useless-return": "warn",
      "complete/no-void-return-type": "warn",
      "complete/prefer-const": "warn",
      "complete/prefer-plusplus": "warn",
      "complete/prefer-postfix-plusplus": "warn",
      "complete/prefer-readonly-parameter-types": "warn",
      "complete/require-break": "warn",
      "complete/require-capital-const-assertions": "warn",
      "complete/require-capital-read-only": "warn",
      "complete/require-unannotated-const-assertions": "warn",
      "complete/require-variadic-function-argument": "warn",
      "complete/strict-array-methods": "warn",
      "complete/strict-enums": "warn",
      "complete/strict-undefined-functions": "warn",
      "complete/strict-void-functions": "warn",
    },

    // Having TypeScript rules apply to ".json" files will throw an error about needing type
    // information.
    ignores: ["*.json"],
  },

  {
    files: ["**/*.js", "**/*.cjs", "**/*.mjs", "**/*.jsx"],
    rules: {
      "complete/no-let-any": "off",
      "complete/no-object-any": "off",
      "complete/require-capital-const-assertions": "off",
      "complete/require-capital-read-only": "off",
    },
  },
);
