/**
 * Helper functions for updating dependencies in a TypeScript project.
 *
 * @module
 */

import { isObject } from "complete-common";
import path from "node:path";
import { run } from "npm-check-updates";
import { $ } from "./execa.js";
import { getFilePath, isFileAsync } from "./file.js";
import { getJSONC } from "./jsonc.js";
import {
  getPackageManagerForProject,
  getPackageManagerInstallCommand,
} from "./packageManager.js";
import { readFileAsync } from "./readWrite.js";

const DEPENDENCY_TYPES_TO_CHECK = ["dependencies", "devDependencies"] as const;

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
  const packagesToIgnore = await getPackagesToIgnore(packageRoot);

  const packageJSONChanged = await (quiet
    ? runNPMCheckUpdatesQuiet(packageJSONPath, packagesToIgnore)
    : runNPMCheckUpdates(packageJSONPath, packagesToIgnore, packageRoot));

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

/**
 * Determine if we should skip the dependencies that are specified in the "package-metadata.json"
 * file.
 */
async function getPackagesToIgnore(
  packageRoot: string,
): Promise<readonly string[]> {
  const metadataPath = path.join(packageRoot, "package-metadata.json");
  const metadataExists = await isFileAsync(metadataPath);
  if (!metadataExists) {
    return [];
  }

  console.log(
    'A "package-metadata.json" was found; looking for dependencies to ignore.',
  );
  const metadata = await getJSONC(metadataPath);

  const packagesToIgnore: string[] = [];

  for (const dependencyType of DEPENDENCY_TYPES_TO_CHECK) {
    const dependenciesObject = metadata[dependencyType];
    if (!isObject(dependenciesObject)) {
      continue;
    }

    for (const [dependencyName, dependencyObject] of Object.entries(
      dependenciesObject,
    )) {
      if (!isObject(dependencyObject)) {
        continue;
      }

      const lockVersion = dependencyObject["lock-version"];
      if (lockVersion !== true) {
        continue;
      }

      const { reason } = dependencyObject;
      if (typeof reason === "string") {
        console.log(
          `Skipping update of ${dependencyType} of "${dependencyName}" because: ${reason}`,
        );
      }

      packagesToIgnore.push(dependencyName);
    }
  }

  return packagesToIgnore;
}

/**
 * It is impossible to invoke `npm-check-updates` programmatically and get the useful CLI output:
 * https://github.com/raineorshine/npm-check-updates/issues/1499
 *
 * Thus, we have to invoke it using a shell.
 *
 * @returns Whether the "package.json" file was changed by `npm-check-updates`.
 */
async function runNPMCheckUpdates(
  packageJSONPath: string,
  packagesToIgnore: readonly string[],
  packageRoot: string,
): Promise<boolean> {
  const $$ = $({ cwd: packageRoot });
  const oldPackageJSONString = await readFileAsync(packageJSONPath);

  // - "--upgrade" is necessary because `npm-check-updates` will be a no-op by default (i.e. it only
  //   displays what is upgradeable).
  // - "--reject" is only necessary if we need to specify dependencies that should not be upgraded.
  await (packagesToIgnore.length === 0
    ? $$`npm-check-updates --upgrade`
    : $$`npm-check-updates --upgrade --reject ${packagesToIgnore.join(",")}`);

  const newPackageJSONString = await readFileAsync(packageJSONPath);
  return oldPackageJSONString !== newPackageJSONString;
}

/**
 * Unlike the `runNPMCheckUpdates` function, we can safely run it through TypeScript when no CLI
 * output is required.
 *
 * @returns Whether the "package.json" file was changed by `npm-check-updates`.
 */
async function runNPMCheckUpdatesQuiet(
  packageJSONPath: string,
  packagesToIgnore: readonly string[],
): Promise<boolean> {
  const upgradedPackages = await run({
    upgrade: true,
    packageFile: packageJSONPath,
    filterVersion: packagesToIgnore,
  });

  if (!isObject(upgradedPackages)) {
    return false;
  }

  return Object.keys(upgradedPackages).length > 0;
}
