// @ts-check

import { defineConfig } from "eslint/config";
import { sortBaseRuleObjects } from "./local-rules/sort-base-rule-objects.mjs";
import { completeConfigBase } from "./src/base.js";

export default defineConfig(
  ...completeConfigBase,

  {
    files: ["src/base/*.js"],
    plugins: {
      "complete-config": {
        rules: {
          "sort-base-rule-objects": sortBaseRuleObjects,
        },
      },
    },
    rules: {
      "complete-config/sort-base-rule-objects": "error",
    },
  },
);
