import { defineConfig } from "eslint/config";
import { completeConfigBase } from "../eslint-config-complete/src/base.js";

export default defineConfig(
  ...completeConfigBase,

  // We must reset the upstream "allowDefaultProject" setting because it includes a glob pattern
  // that matches "docusaurus.config.ts" and we need that file to be explicitly included in this
  // project for type checking to work properly.
  {
    languageOptions: {
      parserOptions: {
        projectService: {
          allowDefaultProject: ["eslint.config.mjs"],
        },
      },
    },
  },

  {
    rules: {
      "import-x/no-default-export": "off", // React uses default exports.
      "n/file-extension-in-import": "off", // Docusaurus does not yet use ESM.
    },
  },

  { ignores: ["**/.docusaurus/", "**/build/"] },
);
