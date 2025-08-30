import ESLintPluginPackageJSON from "eslint-plugin-package-json";
import * as parserJsonc from "jsonc-eslint-parser";
import tseslint from "typescript-eslint";

/**
 * This ESLint config only contains rules from `eslint-plugin-package-json`:
 * https://github.com/JoshuaKGoldberg/eslint-plugin-package-json
 */
export const basePackageJSON = tseslint.config({
  plugins: {
    "package-json": ESLintPluginPackageJSON,
  },

  files: ["**/package.json"],

  languageOptions: {
    parser: parserJsonc,
    parserOptions: {
      extraFileExtensions: [".json"],
    },
  },

  rules: {
    "package-json/no-empty-fields": "warn",
    "package-json/no-redundant-files": "warn",

    /** Disabled since it is handled by `prettier-plugin-packagejson`. */
    "package-json/order-properties": "off",

    "package-json/repository-shorthand": "warn",

    /**
     * Disabled since it is only needed for public npm packages, which is too specific for this
     * config.
     */
    "package-json/require-author": "off",

    /**
     * Disabled since it is only needed for public npm packages, which is too specific for this
     * config.
     */
    "package-json/require-bugs": "off",

    /** Disabled since most projects do not use `bundleDependencies`. */
    "package-json/require-bundleDependencies": "off",

    /** Disabled since not all projects have `dependencies`. */
    "package-json/require-dependencies": "off",

    "package-json/require-description": "warn",

    /** Disabled since not all projects have `devDependencies`. */
    "package-json/require-devDependencies": "off",

    /** Disabled since not all projects have engine version constraints. */
    "package-json/require-engines": "off",

    /**
     * Disabled since it is only needed for public npm packages, which is too specific for this
     * config.
     */
    "package-json/require-files": "off",

    /**
     * Disabled since it is only needed for public npm packages, which is too specific for this
     * config.
     */
    "package-json/require-keywords": "off",

    "package-json/require-name": "warn",

    /** Disabled since not all projects have `optionalDependencies`. */
    "package-json/require-optionalDependencies": "off",

    /** Disabled since not all projects have `peerDependencies`. */
    "package-json/require-peerDependencies": "off",

    "package-json/require-type": "warn",

    /** Disabled since this is only needed for libraries. */
    "package-json/require-types": "off",

    /** Disabled since some private packages may not use versioning. */
    "package-json/require-version": "off",

    /** Disabled since this is supposed to be a project-specific rule. */
    "package-json/restrict-dependency-ranges": "off",

    /** Disabled since it is handled by `prettier-plugin-packagejson`. */
    "package-json/sort-collections": "off",

    "package-json/unique-dependencies": "warn",
    "package-json/valid-author": "warn",
    "package-json/valid-bin": "warn",
    "package-json/valid-bundleDependencies": "warn",
    "package-json/valid-config": "warn",
    "package-json/valid-cpu": "warn",
    "package-json/valid-dependencies": "warn",
    "package-json/valid-description": "warn",
    "package-json/valid-devDependencies": "warn",
    "package-json/valid-directories": "warn",
    "package-json/valid-exports": "warn",
    "package-json/valid-license": "warn",

    /** Disabled since the rule is deprecated. */
    "package-json/valid-local-dependency": "off",

    "package-json/valid-name": "warn",
    "package-json/valid-optionalDependencies": "warn",
    "package-json/valid-package-definition": "warn",
    "package-json/valid-peerDependencies": "warn",
    "package-json/valid-repository-directory": "warn",
    "package-json/valid-scripts": "warn",
    "package-json/valid-type": "warn",
    "package-json/valid-version": "warn",
  },
});
