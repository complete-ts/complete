import ESLintPluginPackageJSON from "eslint-plugin-package-json";
import { defineConfig } from "eslint/config";
import * as parserJsonc from "jsonc-eslint-parser";

/**
 * This ESLint config only contains rules from `eslint-plugin-package-json`:
 * https://github.com/JoshuaKGoldberg/eslint-plugin-package-json
 */
export const basePackageJSON = defineConfig({
  plugins: {
    // @ts-expect-error https://github.com/JoshuaKGoldberg/eslint-plugin-package-json/issues/1242
    "package-json": ESLintPluginPackageJSON,
  },

  files: ["**/package.json"],

  languageOptions: {
    parser: parserJsonc,
    parserOptions: {
      extraFileExtensions: [".json"],
    },
  },

  settings: {
    packageJson: {
      // https://github.com/JoshuaKGoldberg/eslint-plugin-package-json?tab=readme-ov-file#enforceforprivate
      enforceForPrivate: false,
    },
  },

  rules: {
    "package-json/no-empty-fields": "warn",
    "package-json/no-redundant-files": "warn",

    /** Disabled since it is handled by `prettier-plugin-packagejson`. */
    "package-json/order-properties": "off",

    "package-json/repository-shorthand": "warn",
    "package-json/require-author": "warn",
    "package-json/require-bugs": "warn",

    /** Disabled since most projects do not use `bundleDependencies`. */
    "package-json/require-bundleDependencies": "off",

    /** Disabled since not all projects have `dependencies`. */
    "package-json/require-dependencies": "off",

    "package-json/require-description": "warn",

    /** Disabled since not all projects have `devDependencies`. */
    "package-json/require-devDependencies": "off",

    /** Disabled since not all projects have engine version constraints. */
    "package-json/require-engines": "off",

    "package-json/require-files": "warn",

    /**
     * Disabled since not all public npm packages may need additional keywords beyond what is
     * already in their description.
     */
    "package-json/require-keywords": "warn",

    "package-json/require-name": "warn",

    /** Disabled since not all projects have `optionalDependencies`. */
    "package-json/require-optionalDependencies": "off",

    /** Disabled since not all projects have `peerDependencies`. */
    "package-json/require-peerDependencies": "off",

    "package-json/require-type": "warn",

    /** Disabled since this is only needed for libraries. */
    "package-json/require-types": "off",

    "package-json/require-version": "warn",

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
