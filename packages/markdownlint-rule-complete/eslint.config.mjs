// @ts-check

import { defineConfig } from "eslint/config";
import { completeConfigBase } from "../eslint-config-complete/src/base.js";

export default defineConfig(...completeConfigBase, {
  rules: {
    // `markdownlint` rules must have a default export.
    "import-x/no-default-export": "off",
  },
});
