// Packages held back:
// - "typescript" - Stuck on "5.5.4" until TSESLint upgrades:
// https://github.com/typescript-eslint/typescript-eslint/issues/9653

import { updatePackageJSONDependenciesMonorepoChildren } from "complete-node";
import path from "node:path";

/// await updatePackageJSONDependenciesMonorepo();

const REPO_ROOT = path.join(import.meta.dirname, "..");

await updatePackageJSONDependenciesMonorepoChildren(REPO_ROOT);
