// Packages held back:
// - "typescript" - Stuck on "5.5.3" until TSESLint upgrades:
// https://github.com/typescript-eslint/typescript-eslint/issues/9653

import { updatePackageJSONDependenciesMonorepo } from "complete-node";

await updatePackageJSONDependenciesMonorepo();
