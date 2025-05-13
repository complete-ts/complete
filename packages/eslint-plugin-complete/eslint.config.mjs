// @ts-check

import tseslint from "typescript-eslint";
import { completeConfigBase } from "../eslint-config-complete/src/base.js";
import { completeConfigMonorepo } from "../eslint-config-complete/src/monorepo.js";

export default tseslint.config(
  ...completeConfigBase,
  ...completeConfigMonorepo,

  {
    rules: {
      /** This is a common pattern in the testing files. */
      "unicorn/no-array-push-push": "off",

      /** The ESLint API uses `null`. */
      "unicorn/no-null": "off",

      /** This rule conflicts with this plugin's testing style. */
      "unicorn/prefer-single-call": "off",

      /** Some rules use bitwise operators to deal with TypeScript bit flags. */
      "no-bitwise": "off",

      /** We commonly trim the incoming text. */
      "no-param-reassign": "off",
    },
  },

  {
    files: ["src/template.ts", "tests/template.ts", "tests/fixtures/file.ts"],
    rules: {
      "unicorn/no-empty-file": "off",
    },
  },
);
