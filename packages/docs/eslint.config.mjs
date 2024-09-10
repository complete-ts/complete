import { FlatCompat } from "@eslint/eslintrc";
import path from "node:path";
import tseslint from "typescript-eslint";
import { completeConfigBase } from "../eslint-config-complete/src/base.js";
import { completeConfigMonorepo } from "../eslint-config-complete/src/monorepo.js";

const REPO_ROOT = path.join(import.meta.dirname, "..", "..");

const compat = new FlatCompat({
  baseDirectory: import.meta.dirname,
});

export default tseslint.config(
  ...completeConfigBase,
  ...completeConfigMonorepo,
  ...compat.extends("plugin:@docusaurus/recommended"),

  {
    rules: {
      "import-x/no-default-export": "off", // React uses default exports.
      "n/file-extension-in-import": "off", // Docusaurus does not yet use ESM.
      "no-alert": "off",
    },
  },

  {
    ignores: ["**/build/", "**/.docusaurus/"],
  },
);
