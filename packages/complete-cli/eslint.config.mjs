// @ts-check

import tseslint from "typescript-eslint";
import { completeConfigBase } from "../eslint-config-complete/src/base.js";
import { completeConfigMonorepo } from "../eslint-config-complete/src/monorepo.js";

export default tseslint.config(
  ...completeConfigBase,
  ...completeConfigMonorepo,
);
