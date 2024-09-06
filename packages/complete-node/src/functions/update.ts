import path from "node:path";
import { $op } from "./execa.js";
import { getFilePath, readFile } from "./file.js";
import { getPackageManagerForProject } from "./packageManager.js";

/**
 * Helper function to run `npm-check-updates` to update the dependencies in the "package.json" file.
 * If there are any updates, the package manager used in the project will be automatically invoked.
 *
 * @param filePathOrDirPath Either the path to a "package.json" file or the path to a directory
 *                          which contains a "package.json" file. If undefined is passed, the
 *                          current working directory will be used.
 * @param installAfterUpdate Optional. Whether to install the new dependencies afterward, if any.
 *                           Default is true.
 * @param quiet Optional. Whether to suppress console output. Default is false.
 * @returns Whether the "package.json" file was updated.
 */
export function updatePackageJSONDependencies(
  filePathOrDirPath: string | undefined,
  installAfterUpdate = true,
  quiet = false,
): boolean {
  const packageJSONPath = getFilePath("package.json", filePathOrDirPath);
  const packageRoot = path.dirname(packageJSONPath);

  const packageJSONChanged = runNPMCheckUpdates(
    packageJSONPath,
    packageRoot,
    quiet,
  );

  if (packageJSONChanged && installAfterUpdate) {
    const packageManager = getPackageManagerForProject(packageRoot);
    const $$ = $op({
      cwd: packageRoot,
      stdio: quiet ? "pipe" : "inherit",
    });
    $$.sync`${packageManager} install`;
  }

  return packageJSONChanged;
}

/** @returns Whether the "package.json" file was changed by `npm-check-updates`. */
function runNPMCheckUpdates(
  packageJSONPath: string,
  packageRoot: string,
  quiet: boolean,
): boolean {
  const $$ = $op({
    cwd: packageRoot,
    stdio: quiet ? "pipe" : "inherit",
  });

  const oldPackageJSONString = readFile(packageJSONPath);

  // - "--upgrade" is necessary because `npm-check-updates` will be a no-op by default (i.e. it only
  //   displays what is upgradeable).
  // - "--packageFile" is necessary because the current working directory may not contain the
  //   "package.json" file, so we must explicitly specify it.
  // - "--filterVersion" is necessary because if a dependency does not have a "^" prefix, we assume
  //   that it should be a "locked" dependency and not upgraded.
  $$.sync`npm-check-updates --upgrade --packageFile ${packageJSONPath} --filterVersion ^*`;

  const newPackageJSONString = readFile(packageJSONPath);
  return oldPackageJSONString !== newPackageJSONString;
}
