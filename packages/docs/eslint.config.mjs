import { defineConfig } from "eslint/config";
import { completeConfigBase } from "../eslint-config-complete/src/base.js";

export default defineConfig(
  ...completeConfigBase,

  // We must reset the upstream "allowDefaultProject" setting because configuration files in this
  // project are explicitly included in the TypeScript project.
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
      "import-x/no-default-export": "off", // Astro and TypeDoc use default exports.
      "n/file-extension-in-import": "off", // TypeDoc loads ESM configuration files by path.
    },
  },

  { ignores: ["**/.astro/", "**/dist/"] },
);
