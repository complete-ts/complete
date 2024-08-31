import tseslint from "typescript-eslint";

/** This config is only meant to be used in this monorepo. */
export const monorepo = tseslint.config(
  // The "complete-node" dependency is used in scripts and should never appear in a "package.json"
  // file (if it is only used in script files). This has to be a monorepo disable because in a
  // normal project, "complete-node" should be required in "devDependencies".
  {
    files: ["**/scripts/*.{js,cjs,mjs,ts,cts,mts}"],
    rules: {
      // https://github.com/un-ts/eslint-plugin-import-x/issues/141
      "import-x/no-extraneous-dependencies": "off",
    },
  },

  {
    files: ["eslint.config.mjs"],
    rules: {
      // ESLint configs import from "typescript-eslint", but this is installed at the monorepo root
      // instead of in the individual package "package.json" file.
      // https://github.com/un-ts/eslint-plugin-import-x/issues/141
      "import-x/no-extraneous-dependencies": "off",
    },
  },
);
