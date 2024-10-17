import { getPackageJSONFieldMandatory } from "complete-node";
import os from "node:os";
import path from "node:path";

const REPO_ROOT = path.join(import.meta.dirname, "..");

export const HOME_DIR = os.homedir();
export const PROJECT_NAME = getPackageJSONFieldMandatory(REPO_ROOT, "name");
