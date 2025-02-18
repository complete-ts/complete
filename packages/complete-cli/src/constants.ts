import {
  findPackageRoot,
  getPackageJSONFieldsMandatory,
  PackageManager,
} from "complete-node";
import os from "node:os";
import path from "node:path";

export const CWD = process.cwd();
export const CURRENT_DIRECTORY_NAME = path.basename(CWD);

export const HOME_DIR = os.homedir();

const packageRoot = findPackageRoot();
const { name, version } = getPackageJSONFieldsMandatory(
  packageRoot,
  "name",
  "version",
);

export const PROJECT_NAME = name;
export const PROJECT_VERSION = version;

// ---------

export const DEFAULT_PACKAGE_MANAGER = PackageManager.npm;

export const TEMPLATES_DIR = path.join(packageRoot, "file-templates");
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

const GITIGNORE = "_gitignore"; // Not named ".gitignore" to prevent npm from deleting it.
export const GITIGNORE_TEMPLATE_PATH = path.join(
  TEMPLATES_DYNAMIC_DIR,
  GITIGNORE,
);

export const MAIN_TS = "main.ts";
export const MAIN_TS_TEMPLATE_PATH = path.join(
  TEMPLATES_DYNAMIC_DIR,
  "src",
  MAIN_TS,
);
export const MAIN_DEV_TS_TEMPLATE_PATH = path.join(
  TEMPLATES_DYNAMIC_DIR,
  "src",
  "main-dev.ts",
);

export const README_MD = "README.md";

export const TSCONFIG_JSON = "tsconfig.json";
export const TSCONFIG_JSON_PATH = path.join(CWD, TSCONFIG_JSON);
export const CONSTANTS_TS_PATH = path.join(CWD, "src", "constants.ts");

const SCRIPTS_PATH = path.join(CWD, "scripts");
export const PUBLISH_PRE_COPY_PY_PATH = path.join(
  SCRIPTS_PATH,
  "publish_pre_copy.py",
);
export const PUBLISH_POST_COPY_PY_PATH = path.join(
  SCRIPTS_PATH,
  "publish_post_copy.py",
);
