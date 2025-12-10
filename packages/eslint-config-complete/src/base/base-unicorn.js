import esLintPluginUnicorn from "eslint-plugin-unicorn";
import { defineConfig } from "eslint/config";

/**
 * This ESLint config only contains rules from `eslint-plugin-unicorn`:
 * https://github.com/sindresorhus/eslint-plugin-unicorn
 */
export const baseUnicorn = defineConfig({
  plugins: {
    unicorn: esLintPluginUnicorn,
  },

  rules: {
    "unicorn/better-regex": "error",
    "unicorn/catch-error-name": "error",
    "unicorn/consistent-assert": "error",
    "unicorn/consistent-date-clone": "error",

    /** Disabled because it has too many false positives. */
    "unicorn/consistent-destructuring": "off",

    "unicorn/consistent-empty-array-spread": "error",
    "unicorn/consistent-existence-index-check": "error",
    "unicorn/consistent-function-scoping": "error",
    "unicorn/custom-error-definition": "error",
    "unicorn/empty-brace-spaces": "off", // eslint-config-prettier
    "unicorn/error-message": "error",
    "unicorn/escape-case": "error",
    "unicorn/expiring-todo-comments": "error",
    "unicorn/explicit-length-check": "error",

    /** Disabled since projects may use different file naming conventions. */
    "unicorn/filename-case": "off",

    "unicorn/import-style": "error",
    "unicorn/new-for-builtins": "error",

    /**
     * Disabled because if a line breaks three or more ESLint rules, then it is useful to use a
     * single "eslint-disable" comment to make things more concise.
     */
    "unicorn/no-abusive-eslint-disable": "off",

    "unicorn/no-array-sort": "error",
    "unicorn/no-accessor-recursion": "error",
    "unicorn/no-anonymous-default-export": "error",

    /** Disabled since it is not helpful when using TypeScript. */
    "unicorn/no-array-callback-reference": "off",

    "unicorn/no-array-for-each": "error",
    "unicorn/no-array-method-this-argument": "error",
    "unicorn/no-array-push-push": "error",
    "unicorn/no-array-reduce": "error",
    "unicorn/no-array-reverse": "error",
    "unicorn/no-await-expression-member": "error",
    "unicorn/no-await-in-promise-methods": "error",
    "unicorn/no-console-spaces": "error",
    "unicorn/no-document-cookie": "error",
    "unicorn/no-empty-file": "error",
    "unicorn/no-for-loop": "error",
    "unicorn/no-hex-escape": "error",
    "unicorn/no-immediate-mutation": "error",
    "unicorn/no-instanceof-array": "error",
    "unicorn/no-instanceof-builtins": "error",
    "unicorn/no-invalid-fetch-options": "error",
    "unicorn/no-invalid-remove-event-listener": "error",

    /** Disabled because it is common to prefix variables with "new". */
    "unicorn/no-keyword-prefix": "off",

    "unicorn/no-length-as-slice-end": "error",
    "unicorn/no-lonely-if": "error",
    "unicorn/no-magic-array-flat-depth": "error",
    "unicorn/no-negated-condition": "error",
    "unicorn/no-negation-in-equality-check": "error",
    "unicorn/no-nested-ternary": "off", // eslint-config-prettier
    "unicorn/no-new-array": "error",
    "unicorn/no-new-buffer": "error",
    "unicorn/no-named-default": "error",
    "unicorn/no-null": "error",
    "unicorn/no-object-as-default-parameter": "error",

    /**
     * Disabled because using `process.exit` is common to exit command-line applications without
     * verbose output.
     */
    "unicorn/no-process-exit": "off",

    "unicorn/no-single-promise-in-promise-methods": "error",
    "unicorn/no-static-only-class": "error",
    "unicorn/no-thenable": "error",

    /** Superseded by the `@typescript-eslint/no-this-alias` rule. */
    "unicorn/no-this-assignment": "off",

    "unicorn/no-typeof-undefined": "error",
    "unicorn/no-unnecessary-array-flat-depth": "error",
    "unicorn/no-unnecessary-array-splice-count": "error",
    "unicorn/no-unnecessary-slice-end": "error",
    "unicorn/no-unnecessary-await": "error",
    "unicorn/no-unnecessary-polyfills": "error",
    "unicorn/no-unreadable-array-destructuring": "error",
    "unicorn/no-unreadable-iife": "error",
    "unicorn/no-unused-properties": "error",
    "unicorn/no-useless-collection-argument": "error",
    "unicorn/no-useless-error-capture-stack-trace": "error",
    "unicorn/no-useless-fallback-in-spread": "error",
    "unicorn/no-useless-length-check": "error",
    "unicorn/no-useless-promise-resolve-reject": "error",
    "unicorn/no-useless-spread": "error",
    "unicorn/no-useless-switch-case": "error",

    /** Disabled since it does not work properly with TypeScript. */
    "unicorn/no-useless-undefined": "off",

    "unicorn/no-zero-fractions": "error",
    "unicorn/number-literal-case": "off", // eslint-config-prettier
    "unicorn/numeric-separators-style": "error",
    "unicorn/prefer-add-event-listener": "error",
    "unicorn/prefer-array-find": "error",
    "unicorn/prefer-array-flat": "error",
    "unicorn/prefer-array-flat-map": "error",
    "unicorn/prefer-array-index-of": "error",
    "unicorn/prefer-array-some": "error",
    "unicorn/prefer-at": "error",
    "unicorn/prefer-bigint-literals": "error",
    "unicorn/prefer-blob-reading-methods": "error",
    "unicorn/prefer-class-fields": "error",
    "unicorn/prefer-classlist-toggle": "error",
    "unicorn/prefer-code-point": "error",
    "unicorn/prefer-date-now": "error",
    "unicorn/prefer-default-parameters": "error",
    "unicorn/prefer-dom-node-append": "error",
    "unicorn/prefer-dom-node-dataset": "error",
    "unicorn/prefer-dom-node-remove": "error",
    "unicorn/prefer-dom-node-text-content": "error",
    "unicorn/prefer-event-target": "error",
    "unicorn/prefer-export-from": "error",
    "unicorn/prefer-global-this": "error",
    "unicorn/prefer-import-meta-properties": "error",
    "unicorn/prefer-includes": "error",

    /** Disabled because the rule is not compatible with TypeScript. */
    "unicorn/prefer-json-parse-buffer": "off",

    "unicorn/prefer-keyboard-event-key": "error",
    "unicorn/prefer-logical-operator-over-ternary": "error",
    "unicorn/prefer-math-min-max": "error",
    "unicorn/prefer-math-trunc": "error",
    "unicorn/prefer-modern-dom-apis": "error",
    "unicorn/prefer-modern-math-apis": "error",
    "unicorn/prefer-module": "error",
    "unicorn/prefer-native-coercion-functions": "error",
    "unicorn/prefer-negative-index": "error",
    "unicorn/prefer-node-protocol": "error",
    "unicorn/prefer-number-properties": "error",
    "unicorn/prefer-object-from-entries": "error",
    "unicorn/prefer-optional-catch-binding": "error",
    "unicorn/prefer-prototype-methods": "error",
    "unicorn/prefer-query-selector": "error",
    "unicorn/prefer-reflect-apply": "error",
    "unicorn/prefer-regexp-test": "error",
    "unicorn/prefer-response-static-json": "error",
    "unicorn/prefer-set-has": "error",
    "unicorn/prefer-set-size": "error",
    "unicorn/prefer-single-call": "error",
    "unicorn/prefer-spread": "error",
    "unicorn/prefer-string-raw": "error",
    "unicorn/prefer-string-replace-all": "error",
    "unicorn/prefer-string-slice": "error",
    "unicorn/prefer-string-starts-ends-with": "error",
    "unicorn/prefer-string-trim-start-end": "error",
    "unicorn/prefer-structured-clone": "error",
    "unicorn/prefer-switch": "error",
    "unicorn/prefer-ternary": "error",
    "unicorn/prefer-top-level-await": "error",
    "unicorn/prefer-type-error": "error",

    /** Disabled since it is common to use the variable name of "i". */
    "unicorn/prevent-abbreviations": "off",

    "unicorn/relative-url-style": "error",
    "unicorn/require-array-join-separator": "error",
    "unicorn/require-module-attributes": "error",
    "unicorn/require-module-specifiers": "error",
    "unicorn/require-number-to-fixed-digits-argument": "error",

    /** Disabled since it is not recommended by the plugin authors. */
    "unicorn/require-post-message-target-origin": "off",

    /** Disabled since string content enforcement is too project-specific. */
    "unicorn/string-content": "off",

    "unicorn/switch-case-braces": "error",

    /**
     * Even though this rule is in `eslint-config-prettier`, it is not actually handled by Prettier.
     */
    "unicorn/template-indent": "error",

    "unicorn/text-encoding-identifier-case": "error",
    "unicorn/throw-new-error": "error",
  },
});
