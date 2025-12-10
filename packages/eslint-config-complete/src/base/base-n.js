import esLintPluginN from "eslint-plugin-n";
import { defineConfig } from "eslint/config";

/**
 * This ESLint config only contains rules from `eslint-plugin-n`:
 * https://github.com/eslint-community/eslint-plugin-n
 * (This is a forked version of `eslint-plugin-node`.)
 */
export const baseN = defineConfig({
  plugins: {
    n: esLintPluginN,
  },

  rules: {
    /** Disabled since stylistic rules from this plugin are not used. */
    "n/callback-return": "off",

    /** Disabled since stylistic rules from this plugin are not used. */
    "n/exports-style": "off",

    /**
     * This rule is helpful to automatically fix file extensions in import statements throughout an
     * entire codebase.
     */
    "n/file-extension-in-import": ["error", "always"],

    /** Disabled since stylistic rules from this plugin are not used. */
    "n/global-require": "off",

    "n/handle-callback-err": "error",

    /**
     * Disabled since it does not work very well with TypeScript. (It needs project-specific
     * configuration depending on where the output directory is located.)
     */
    "n/hashbang": "off", // cspell:disable-line

    "n/no-callback-literal": "error",
    "n/no-deprecated-api": "error",
    "n/no-exports-assign": "error",

    /** Disabled since it is handled by the TypeScript compiler. */
    "n/no-extraneous-import": "off",

    /** Disabled since require statements are not used in TypeScript code. */
    "n/no-extraneous-require": "off",

    /** Disabled because this rule is deprecated. */
    "n/no-hide-core-modules": "off",

    /** Disabled since it is handled by the TypeScript compiler. */
    "n/no-missing-import": "off",

    /** Disabled since it is handled by the TypeScript compiler. */
    "n/no-missing-require": "off",

    /** Disabled since stylistic rules from this plugin are not used. */
    "n/no-mixed-requires": "off",

    "n/no-new-require": "error",
    "n/no-path-concat": "error",

    /** Disabled since stylistic rules from this plugin are not used. */
    "n/no-process-env": "off",

    /**
     * Disabled because using `process.exit` is common to exit command-line applications without
     * verbose output.
     */
    "n/no-process-exit": "off",

    /** Disabled since stylistic rules from this plugin are not used. */
    "n/no-restricted-import": "off",

    /** Disabled since stylistic rules from this plugin are not used. */
    "n/no-restricted-require": "off",

    /** Disabled since stylistic rules from this plugin are not used. */
    "n/no-sync": "off",

    /**
     * Disabled since modern ESM projects that are written in TypeScript do not generally have to
     * worry about interop with `require`.
     */
    "n/no-top-level-await": "off",

    "n/no-unpublished-bin": "error",

    /** Superseded by the `import-x/no-extraneous-dependencies` rule. */
    "n/no-unpublished-import": "off",

    /** Disabled since it is assumed that source code will be written in ESM. */
    "n/no-unpublished-require": "off",

    /** Disabled because it is assumed that we are running on modern versions of Node.js. */
    "n/no-unsupported-features/es-builtins": "off",

    /**
     * Disabled because it is assumed that our transpiler or runtime has support for the latest
     * version of ESM.
     */
    "n/no-unsupported-features/es-syntax": "off",

    /** Disabled since it is handled by the TypeScript compiler. */
    "n/no-unsupported-features/node-builtins": "off",

    /** Disabled since stylistic rules from this plugin are not used. */
    "n/prefer-global/buffer": "off",

    /** Disabled since stylistic rules from this plugin are not used. */
    "n/prefer-global/console": "off",

    /** Disabled since stylistic rules from this plugin are not used. */
    "n/prefer-global/process": "off",

    /** Disabled since stylistic rules from this plugin are not used. */
    "n/prefer-global/text-decoder": "off",

    /** Disabled since stylistic rules from this plugin are not used. */
    "n/prefer-global/text-encoder": "off",

    /** Disabled since stylistic rules from this plugin are not used. */
    "n/prefer-global/url": "off",

    /** Disabled since stylistic rules from this plugin are not used. */
    "n/prefer-global/url-search-params": "off",

    /** Superseded by the `unicorn/prefer-node-protocol` rule. */
    "n/prefer-node-protocol": "off",

    /** Disabled since stylistic rules from this plugin are not used. */
    "n/prefer-promises/dns": "off",

    /** Disabled since stylistic rules from this plugin are not used. */
    "n/prefer-promises/fs": "off",

    "n/process-exit-as-throw": "error",

    /** Superseded by the `n/hashbang` rule. */
    "n/shebang": "off",
  },
});
