// @ts-check

import { defineConfig } from "eslint/config";
import { completeConfigBase } from "../eslint-config-complete/src/base.js";

export default defineConfig(
  ...completeConfigBase,

  {
    files: ["src/functions/**"],
    rules: {
      "perfectionist/sort-modules": "error",
    },
  },
);
