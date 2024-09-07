import { completeConfigBase } from "./packages/eslint-config-complete/src/base.js";
import { completeConfigMonorepo } from "./packages/eslint-config-complete/src/monorepo.js";

export default [...completeConfigBase, ...completeConfigMonorepo];
