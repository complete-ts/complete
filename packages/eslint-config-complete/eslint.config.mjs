import tseslint from "typescript-eslint";
import { completeConfigBase } from "./src/base.js";
import { completeConfigMonorepo } from "./src/monorepo.js";

export default tseslint.config(
  ...completeConfigBase,
  ...completeConfigMonorepo,
);
