/**
 * Helper functions for updating dependencies in a TypeScript project.
 *
 * @module
 */

import { isObject } from "complete-common";
import path from "node:path";
import ncu from "npm-check-updates";
import { $ } from "./execa.js";
import { getFilePath } from "./file.js";
import {
  getPackageManagerForProject,
  getPackageManagerInstallCommand,
} from "./packageManager.js";
import { readFile } from "./readWrite.js";

/**
 * Helper function to run `npm-check-updates` to update the dependencies in the "package.json" file.
 * If there are any updates, the package manager used in the project will be automatically invoked.
 *
 * If specific versions need to be kept back, they should be placed in a "package-metadata.json"
 * next to the respective "package.json" file like this:
 *
 * ```json
 * {
 *   "dependencies": {
 *     "react": {
 *       "lock-version": true,
 *       "reason": "Docusaurus does not support the latest version of React."
 *     }
 *   }
 * }
 * ```
 *
 * @param filePathOrDirPath Either the path to a "package.json" file or the path to a directory
 *                          which contains a "package.json" file. If undefined is passed, the
 *                          current working directory will be used.
 * @param installAfterUpdate Optional. Whether to install the new dependencies afterward, if any.
 *                           Default is true.
 * @param quiet Optional. Whether to suppress console output. Default is false.
 * @returns Whether the "package.json" file was updated.
 */
export async function updatePackageJSONDependencies(
  filePathOrDirPath?: string,
  installAfterUpdate = true,
  quiet = false,
): Promise<boolean> {
  const packageJSONPath = getFilePath("package.json", filePathOrDirPath);
  const packageRoot = path.dirname(packageJSONPath);

  const packageJSONChangedPromise = quiet
    ? runNPMCheckUpdatesQuiet(packageJSONPath)
    : runNPMCheckUpdates(packageJSONPath, packageRoot);
  const packageJSONChanged = await packageJSONChangedPromise;

  if (packageJSONChanged && installAfterUpdate) {
    const $$ = $({
      cwd: packageRoot,
      stdout: quiet ? "pipe" : "inherit",
      stderr: quiet ? "pipe" : "inherit",
    });
    const packageManager = await getPackageManagerForProject(packageRoot);
    const command = getPackageManagerInstallCommand(packageManager);
    const commandParts = command.split(" ");
    await $$`${commandParts}`;
  }

  return packageJSONChanged;
}

/** @returns Whether the "package.json" file was changed by `npm-check-updates`. */
async function runNPMCheckUpdates(
  packageJSONPath: string,
  packageRoot: string,
): Promise<boolean> {
  const $$ = $({ cwd: packageRoot });
  const oldPackageJSONString = readFile(packageJSONPath);

  // We want to run the CLI command instead of invoking the API because it provides a progress meter
  // and pretty diff.

  // - "--upgrade" is necessary because `npm-check-updates` will be a no-op by default (i.e. it only
  //   displays what is upgradeable).
  // - "--packageFile" is necessary because the current working directory may not contain the
  //   "package.json" file, so we must explicitly specify it.
  // - "--filterVersion" is necessary because if a dependency does not have a "^" prefix, we assume
  //   that it should be a "locked" dependency and not upgraded.
  await $$`npm-check-updates --upgrade --packageFile ${packageJSONPath} --filterVersion ^*`;

  const newPackageJSONString = readFile(packageJSONPath);
  return oldPackageJSONString !== newPackageJSONString;
}

/** @returns Whether the "package.json" file was changed by `npm-check-updates`. */
async function runNPMCheckUpdatesQuiet(
  packageJSONPath: string,
): Promise<boolean> {
  const upgradedPackages = await ncu.run({
    upgrade: true,
    packageFile: packageJSONPath,
    filterVersion: "^*",
  });

  if (!isObject(upgradedPackages)) {
    return false;
  }

  return Object.keys(upgradedPackages).length > 0;
}
