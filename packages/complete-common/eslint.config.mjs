// @ts-check

import { completeConfigBase } from "../eslint-config-complete/src/base.js";
// @ts-expect-error https://github.com/jrdrg/eslint-plugin-sort-exports/issues/44
import esLintPluginSortExports from "eslint-plugin-sort-exports";
import { defineConfig } from "eslint/config";

export default defineConfig(
  ...completeConfigBase,

  {
    plugins: {
      /** The `sort-exports` rule is used in some specific files. */
      "sort-exports": esLintPluginSortExports,
    },
  },

  {
    files: ["src/functions/**"],
    rules: {
      /** Not defined in the parent configs. */
      "sort-exports/sort-exports": [
        "error",
        {
          sortDir: "asc",
        },
      ],
    },
  },
);
