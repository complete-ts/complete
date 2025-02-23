/**
 * Helper functions for updating dependencies in a TypeScript project.
 *
 * @module
 */

import { isObject } from "complete-common";
import path from "node:path";
import ncu from "npm-check-updates";
import { $ } from "./execa.js";
import { getFilePath, isFileAsync } from "./file.js";
import { getJSONC } from "./jsonc.js";
import {
  getPackageManagerForProject,
  getPackageManagerInstallCommand,
} from "./packageManager.js";

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

  const packageJSONChangedPromise = runNPMCheckUpdates(
    packageJSONPath,
    packagesToIgnore,
    quiet,
  );
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

/**
 * Determine if we should skip the dependencies that are specified in the "package-metadata.json"
 * file.
 */
async function getPackagesToIgnore(
  packageRoot: string,
): Promise<readonly string[]> {
  const packagesToIgnore: string[] = [];

  const metadataPath = path.join(packageRoot, "package-metadata.json");
  const metadataExists = await isFileAsync(metadataPath);
  if (metadataExists) {
    const metadata = await getJSONC(metadataPath);
    for (const dependencyType of DEPENDENCY_TYPES_TO_CHECK) {
      const dependenciesArray = metadata[dependencyType];
      if (!isObject(dependenciesArray)) {
        continue;
      }

      for (const [key, value] of Object.entries(dependenciesArray)) {
        if (!isObject(value)) {
          continue;
        }

        const { lockVersion } = value;
        if (lockVersion !== "true") {
          continue;
        }

        const { reason } = value;
        if (typeof reason === "string") {
          console.log(
            `Skipping update of ${dependencyType} of "${key}" because: ${reason}`,
          );
        }

        packagesToIgnore.push(key);
      }
    }
  }

  return packagesToIgnore;
}

/** @returns Whether the "package.json" file was changed by `npm-check-updates`. */
async function runNPMCheckUpdates(
  packageJSONPath: string,
  packagesToIgnore: readonly string[],
  quiet: boolean,
): Promise<boolean> {
  const upgradedPackages = await ncu.run(
    {
      upgrade: true,
      packageFile: packageJSONPath,
      // TODO: Remove the below type assertion when this pull request is merged:
      // https://github.com/raineorshine/npm-check-updates/pull/1498
      filterVersion: packagesToIgnore as string[],
    },
    {
      // By default, invoking `npm-check-updates` through the API will not produce any console
      // output. Setting "cli" to true will re-enable the console output, which is nice because it
      // tells the end-user exactly which packages were updated.
      cli: !quiet,
    },
  );

  if (!isObject(upgradedPackages)) {
    return false;
  }

  return Object.keys(upgradedPackages).length > 0;
}
