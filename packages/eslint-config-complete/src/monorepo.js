import tseslint from "typescript-eslint";

/**
 * This ESLint config is meant to be used in monorepos that install dependencies at the root (in
 * addition to the `completeBase` config).
 */
export const completeConfigMonorepo = tseslint.config(
  {
    files: ["**/scripts/*.{js,cjs,mjs,ts,cts,mts}"],
    rules: {
      // The dependencies that are used in monorepo package scripts are often installed at the root
      // of the monorepo (instead of as a "devDependency" in the package's "package.json" file).
      "import-x/no-extraneous-dependencies": "off",
    },
  },

  {
    files: ["eslint.config.mjs"],
    rules: {
      // ESLint configs in monorepos often intentionally import from the "src" subdirectory (because
      // the config files are JavaScript so they cannot use tsconfig-paths).
      "@typescript-eslint/no-restricted-imports": "off",

      // ESLint configs in monorepos often intentionally import from the "packages" subdirectory
      // (because the config files are JavaScript so they cannot use tsconfig-paths).
      "import-x/no-relative-packages": "off",

      // ESLint configs in monorepos will import from "typescript-eslint" (and potentially other
      // plugins), which is often installed at root of the monorepo.
      "import-x/no-extraneous-dependencies": "off",
    },
  },
);
