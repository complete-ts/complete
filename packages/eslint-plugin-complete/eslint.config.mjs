// @ts-check

import { defineConfig } from "eslint/config";
import { completeConfigBase } from "../eslint-config-complete/src/base.js";
import { completeConfigESLintPlugin } from "../eslint-config-complete/src/eslint-plugin.js";

export default defineConfig(
  ...completeConfigBase,
  ...completeConfigESLintPlugin,

  {
    rules: {
      /** Some rules use bitwise operators to deal with TypeScript bit flags. */
      "no-bitwise": "off",

      /** We commonly trim incoming text. */
      "no-param-reassign": "off",

      /** These rules conflict with this plugin's testing style. */
      "unicorn/no-immediate-mutation": "off",
      "unicorn/prefer-single-call": "off",
    },
  },

  {
    files: ["src/template.ts", "tests/template.ts", "tests/fixtures/file.ts"],
    rules: {
      "unicorn/no-empty-file": "off",
    },
  },

  {
    files: ["src/rules/*.ts", "tests/rules/*.ts"],
    rules: {
      "complete/sort-objects": "off",
    },
  },
);
