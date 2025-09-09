import { getPackageJSONFieldsMandatory, PackageManager } from "complete-node";
import os from "node:os";
import path from "node:path";

export const CWD = process.cwd();
export const CURRENT_DIRECTORY_NAME = path.basename(CWD);

export const HOME_DIR = os.homedir();

const PACKAGE_ROOT = path.resolve(import.meta.dirname, "..");
const { name, version } = await getPackageJSONFieldsMandatory(
  PACKAGE_ROOT,
  "name",
  "version",
);

export const PROJECT_NAME = name;
export const PROJECT_VERSION = version;

export const DEFAULT_PACKAGE_MANAGER = PackageManager.npm;

const TEMPLATES_DIR = path.join(PACKAGE_ROOT, "file-templates");
export const TEMPLATES_STATIC_DIR = path.join(TEMPLATES_DIR, "static");
export const TEMPLATES_DYNAMIC_DIR = path.join(TEMPLATES_DIR, "dynamic");

export const ACTION_YML = "action.yml";
export const ACTION_YML_TEMPLATE_PATH = path.join(
  TEMPLATES_DYNAMIC_DIR,
  ".github",
  "workflows",
  "setup",
  ACTION_YML,
);
