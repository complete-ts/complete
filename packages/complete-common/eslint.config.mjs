// @ts-check

import { completeConfigBase } from "../eslint-config-complete/src/base.js";
import { defineConfig } from "eslint/config";

export default defineConfig(
  ...completeConfigBase,

  {
    files: ["src/functions/**"],
    rules: {
      "perfectionist/sort-exports": "error",
    },
  },
);
