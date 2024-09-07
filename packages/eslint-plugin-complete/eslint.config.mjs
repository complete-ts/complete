import tseslint from "typescript-eslint";
import { completeConfigBase } from "../eslint-config-complete/src/base.js";
import { completeConfigMonorepo } from "../eslint-config-complete/src/monorepo.js";

export default tseslint.config(
  ...completeConfigBase,
  ...completeConfigMonorepo,

  {
    rules: {
      /**
       * Defined at: base-unicorn.js
       *
       * This is a common pattern in the testing files.
       */
      "unicorn/no-array-push-push": "off",

      /**
       * Defined at: base-unicorn.js
       *
       * The ESLint API uses `null`.
       */
      "unicorn/no-null": "off",

      /**
       * Defined at: base-eslint.js
       *
       * Some rules use bitwise operators to deal with TypeScript bit flags.
       */
      "no-bitwise": "off",

      /**
       * Defined at: base-eslint.js
       *
       * We commonly trim the incoming text.
       */
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
