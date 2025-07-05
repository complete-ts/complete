import tseslint from "typescript-eslint";
import { completeConfigBase } from "../eslint-config-complete/src/base.js";

export default tseslint.config(
  ...completeConfigBase,

  {
    rules: {
      "import-x/no-default-export": "off", // React uses default exports.
      "n/file-extension-in-import": "off", // Docusaurus does not yet use ESM.
      "no-alert": "off",
    },
  },

  {
    ignores: ["**/.docusaurus/", "**/build/"],
  },
);
