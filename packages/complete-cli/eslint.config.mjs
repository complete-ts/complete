// @ts-check

import { defineConfig } from "eslint/config";
import { completeConfigBase } from "../eslint-config-complete/src/base.js";

export default defineConfig(
  ...completeConfigBase,

  {
    rules: {
      // The Clipanion library has methods with capital letters.
      "new-cap": "off",

      // The Clipanion library forces usage of classes to execute unrelated code.
      "@typescript-eslint/class-methods-use-this": "off",
    },
  },

  {
    // We do not want to lint template files, since they do not have valid code inside of them yet.
    ignores: ["**/file-templates/**"],
  },
);
