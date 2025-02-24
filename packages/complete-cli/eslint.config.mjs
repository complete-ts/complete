// @ts-check

import tseslint from "typescript-eslint";
import { completeConfigBase } from "../eslint-config-complete/src/base.js";
import { completeConfigMonorepo } from "../eslint-config-complete/src/monorepo.js";

export default tseslint.config(
  ...completeConfigBase,
  ...completeConfigMonorepo,

  {
    rules: {
      // The Clipanion library has methods with capital letters.
      "new-cap": "off",

      // The Clipanion library forces usage of classes to execute unrelated code.
      "@typescript-eslint/class-methods-use-this": "off",

      // Since we bundle all of the dependencies into a single file, we prevent npm from downloading
      // the dependencies by moving them all to the "devDependencies" field in the "package.json".
      /// "import-x/no-extraneous-dependencies": "off",
    },
  },

  {
    ignores: [
      // We do not want to lint template files, since they do not have valid code inside of them
      // yet.
      "**/file-templates/**",
    ],
  },
);
