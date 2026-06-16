// @ts-check

import { defineConfig } from "eslint/config";
import { sortBaseRuleObjects } from "./local-rules/sort-base-rule-objects.mjs";
import { completeConfigBase } from "./src/base.js";

export default defineConfig(
  ...completeConfigBase,
  {
    rules: {
      "unicorn/comment-content": "off",
      "unicorn/consistent-boolean-name": "off",
      "unicorn/no-asterisk-prefix-in-documentation-comments": "off",
      "unicorn/no-manually-wrapped-comments": "off",
      "unicorn/no-top-level-assignment-in-function": "off",
      "unicorn/no-top-level-side-effects": "off",
      "unicorn/no-unsafe-string-replacement": "off",
      "unicorn/require-array-sort-compare": "off",
    },
  },
  {
    files: ["eslint.config.mjs", "local-rules/*.mjs"],
    rules: {
      "complete/complete-sentences-jsdoc": "off",
      "jsdoc/type-formatting": "off",
    },
  },
  {
    files: ["local-rules/*.mjs"],
    rules: {
      "import-x/no-relative-packages": "off",
    },
  },
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
