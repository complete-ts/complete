// Packages held back:
// - n/a

import { updatePackageJSONDependenciesMonorepoChildren } from "complete-node";
import path from "node:path";

/// await updatePackageJSONDependenciesMonorepo();
const REPO_ROOT = path.join(import.meta.dirname, "..");
await updatePackageJSONDependenciesMonorepoChildren(REPO_ROOT);
