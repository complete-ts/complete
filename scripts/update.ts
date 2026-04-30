import { updatePackageJSONDependencies } from "complete-node";
import path from "node:path";

const REPO_ROOT = path.resolve(import.meta.dirname, "..");
await updatePackageJSONDependencies(REPO_ROOT);
