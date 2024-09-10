import tseslint from "typescript-eslint";

/**
 * This ESLint config is meant to be used in monorepos that install dependencies at the root (in
 * addition to the `completeBase` config).
 */
export const completeConfigMonorepo = tseslint.config({
  files: ["eslint.config.mjs"],
  rules: {
    // ESLint configs in monorepos often intentionally import from the "src" subdirectory (because
    // the config files are JavaScript so they cannot use tsconfig-paths).
    "@typescript-eslint/no-restricted-imports": "off",

    // ESLint configs in monorepos often intentionally import from the "packages" subdirectory
    // (because the config files are JavaScript so they cannot use tsconfig-paths).
    "import-x/no-relative-packages": "off",
  },
});
