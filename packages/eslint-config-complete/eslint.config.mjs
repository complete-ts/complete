// @ts-check

import tseslint from "typescript-eslint";
import { completeConfigBase } from "./src/base.js";

export default tseslint.config(...completeConfigBase);
