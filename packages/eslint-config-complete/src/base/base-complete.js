import ESLintPluginComplete from "eslint-plugin-complete";
import { defineConfig } from "eslint/config";

/**
 * This ESLint config only contains rules from `eslint-plugin-complete`:
 * https://complete-ts.github.io/eslint-plugin-complete
 */
export const baseComplete = defineConfig(
  {
    plugins: {
      // TODO: The `defineConfig` helper function is bugged.
      // @ts-expect-error https://github.com/typescript-eslint/typescript-eslint/issues/11543
      complete: ESLintPluginComplete,
    },

    rules: {
      "complete/complete-sentences-jsdoc": "error",
      "complete/complete-sentences-line-comments": "error",
      "complete/consistent-enum-values": "error",
      "complete/consistent-named-tuples": "error",
      "complete/eqeqeq-fix": "error",
      "complete/format-jsdoc-comments": "error",
      "complete/format-line-comments": "error",
      "complete/jsdoc-code-block-language": "error",
      "complete/newline-between-switch-case": "error",
      "complete/no-confusing-set-methods": "error",
      "complete/no-empty-jsdoc": "error",
      "complete/no-empty-line-comments": "error",
      "complete/no-explicit-array-loops": "error",
      "complete/no-explicit-map-set-loops": "error",
      "complete/no-for-in": "error",
      "complete/no-let-any": "error",
      "complete/no-mutable-return": "error",
      "complete/no-number-enums": "error",
      "complete/no-object-any": "error",
      "complete/no-object-methods-with-map-set": "error",
      "complete/no-string-length-0": "error",
      "complete/no-template-curly-in-string-fix": "error",
      "complete/no-undefined-return-type": "error",
      "complete/no-unnecessary-assignment": "error",
      "complete/no-unsafe-plusplus": "error",
      "complete/no-useless-return": "error",
      "complete/no-void-return-type": "error",
      "complete/prefer-const": "error",
      "complete/prefer-plusplus": "error",
      "complete/prefer-postfix-plusplus": "error",
      "complete/prefer-readonly-parameter-types": "error",
      "complete/require-break": "error",
      "complete/require-capital-const-assertions": "error",
      "complete/require-capital-read-only": "error",
      "complete/require-unannotated-const-assertions": "error",
      "complete/require-variadic-function-argument": "error",
      "complete/strict-array-methods": "error",
      "complete/strict-enums": "error",
      "complete/strict-undefined-functions": "error",
      "complete/strict-void-functions": "error",
    },

    // Rules that require type information will throw an error on ".json" files. (This is needed
    // when using `eslint-plugin-package-json`. Even though this config does not currently use the
    // plugin, we include it here defensively.)
    ignores: ["**/*.json", "**/*.jsonc"],
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
