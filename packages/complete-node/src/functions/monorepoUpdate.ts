/**
 * Helper functions for updating dependencies within a [monorepo](https://monorepo.tools/).
 *
 * @module
 */

import type { ReadonlyRecord } from "complete-common";
import { assertDefined, assertString, isObject } from "complete-common";
import path from "node:path";
import { packageDirectory } from "package-directory";
import { isFile } from "./file.js";
import { getMonorepoPackageNames } from "./monorepo.js";
import { getPackageJSON, getPackageJSONDependencies } from "./packageJSON.js";
import { writeFile } from "./readWrite.js";
import { updatePackageJSONDependencies } from "./update.js";

type DepType = "dependencies" | "devDependencies" | "peerDependencies";

type PendingPackageJSONUpdates = Map<
  string,
  readonly [
    packageJSON: Record<string, unknown>,
    updates: Array<{
      depType: DepType;
      depName: string;
      newVersion: string;
    }>,
  ]
>;

const DEPENDENCY_TYPES_TO_CHECK = ["dependencies", "devDependencies"] as const;

/**
 * Helper function to:
 *
 * - Check if all of the dependencies in the monorepo children "package.json" files are up to date.
 * - Check if all of the dependencies in the monorepo children "package.json" files are non-exact.
 * - Check if any dependencies in the monorepo root "package.json" are unused.
 *
 * This is intended to be called in a monorepo lint script. It will exit the program with an error
 * code of 1 if discrepancies are found.
 *
 * This function attempts to find the monorepo root directory automatically based on searching
 * backwards from the file of the calling function.
 */
export async function lintMonorepoPackageJSONs(
  monorepoRoot: string,
): Promise<void> {
  const valid = await updatePackageJSONDependenciesMonorepoChildren(
    monorepoRoot,
    true,
  );
  if (!valid) {
    console.error('One or more child "package.json" files are out of sync.');
    process.exit(1);
  }
}

/**
 * Helper function to update the dependencies in all of the monorepo "package.json" files. If there
 * are any updates, the package manager used in the project will be automatically invoked to install
 * them.
 *
 * This function attempts to find the monorepo root directory automatically based on searching
 * backwards from the file of the calling function.
 *
 * Under the hood, this function calls the `updatePackageJSONDependencies` and
 * `updatePackageJSONDependenciesMonorepoChildren` helper functions.
 *
 * If you need to check to see if the monorepo dependencies are up to date in a lint script, then
 * use the `lintMonorepoPackageJSONs` function instead.
 *
 * @param importMetaDirname The value of `import.meta.dirname` (so that this function can find the
 *                          package root).
 * @returns Whether any "package.json" files were changed.
 */
export async function updatePackageJSONDependenciesMonorepo(
  importMetaDirname: string,
): Promise<boolean> {
  const monorepoRoot = await packageDirectory({ cwd: importMetaDirname });
  assertDefined(
    monorepoRoot,
    `Failed to find the package root from the directory of: ${monorepoRoot}`,
  );

  // First, update the main "package.json" at the root of the monorepo.
  const monorepoPackageJSONChanged =
    await updatePackageJSONDependencies(monorepoRoot);

  // Second, check to see if child "package.json" dependencies are up to date.
  const zeroFilesChanged =
    await updatePackageJSONDependenciesMonorepoChildren(monorepoRoot);

  return monorepoPackageJSONChanged || !zeroFilesChanged;
}

/**
 * Helper function to only update the dependencies in the "package.json" files of the sub-packages
 * of a monorepo.
 *
 * This will update both the normal dependencies (to match what is in the monorepo root
 * "package.json") and the monorepo dependencies (to be what is listed in the "version" field of the
 * respective "package.json" file).
 *
 * This function is called by the `updatePackageJSONDependenciesMonorepo` script.
 *
 * If you need to check to see if the monorepo dependencies are up to date in a lint script, then
 * use the `lintMonorepoPackageJSONs` function instead.
 *
 * @param monorepoRoot The full path to the monorepo root directory.
 * @param dryRun Optional. If true, will not modify the "package.json" files. Defaults to false.
 * @returns Whether all of the "package.json" files were valid.
 */
export async function updatePackageJSONDependenciesMonorepoChildren(
  monorepoRoot: string,
  dryRun = false,
): Promise<boolean> {
  // First, get and validate the root monorepo "package.json" file.
  const monorepoDependencies = await getPackageJSONDependencies(monorepoRoot);
  assertDefined(
    monorepoDependencies,
    `The "${monorepoRoot}/package.json" file does not have a "dependencies" field.`,
  );

  // Second, get the child "package.json" files.
  const monorepoPackageNames = await getMonorepoPackageNames(monorepoRoot);
  const childPackageJSONMap = await getMonorepoChildPackageJSONMap(
    monorepoRoot,
    monorepoPackageNames,
  );

  // Third, validate that all of the root monorepo dependencies are being used.
  const monorepoDepsUsed = isAllMonorepoDepsUsed(
    monorepoDependencies,
    childPackageJSONMap,
  );
  if (!monorepoDepsUsed) {
    throw new Error("One or more monorepo dependencies are unused.");
  }

  // Fourth, validate the child "package.json" files.
  const pendingPackageJSONUpdates: PendingPackageJSONUpdates = new Map();
  let valid = true;

  for (const [childPackageName, childPackageJSON] of childPackageJSONMap) {
    for (const depType of DEPENDENCY_TYPES_TO_CHECK) {
      const childDependencies = childPackageJSON[depType];
      if (!isObject(childDependencies)) {
        continue;
      }

      for (const [depName, depVersion] of Object.entries(childDependencies)) {
        assertString(
          depVersion,
          `The child package dependency value of "${childPackageName} --> ${depName}" is not a string.`,
        );

        if (depVersion.startsWith("^")) {
          throw new Error(
            `A dependency is non-exact in "${childPackageName}": ${depName} - ${depVersion}`,
          );
        }

        const otherPackageJSON = childPackageJSONMap.get(depName);
        if (otherPackageJSON === undefined) {
          // This is not a monorepo package, so we have to look for the correct version in the root
          // monorepo "package.json" file.
          const monorepoVersion = monorepoDependencies[depName];
          assertString(
            monorepoVersion,
            `The monorepo package dependency of "${depName}" is not a string.`,
          );

          if (depVersion !== monorepoVersion) {
            valid = false;

            if (dryRun) {
              console.log(
                `A dependency is out of date in "${childPackageName}": ${depName} - ${depVersion} --> ${monorepoVersion}`,
              );
            } else {
              addPendingUpdate(
                pendingPackageJSONUpdates,
                childPackageName,
                childPackageJSON,
                depType,
                depName,
                monorepoVersion,
              );
            }
          }
        } else {
          // This is a monorepo package, so we have to look for the correct version in the
          // individual package's "package.json" file.
          const correctVersion = otherPackageJSON["version"];
          assertString(
            correctVersion,
            `The "version" property of the "${depName}" package is not a string.`,
          );

          if (depVersion !== correctVersion) {
            valid = false;

            if (dryRun) {
              console.log(
                `A dependency is out of date in "${childPackageName}": ${depName} - ${depVersion} --> ${correctVersion}`,
              );
            } else {
              addPendingUpdate(
                pendingPackageJSONUpdates,
                childPackageName,
                childPackageJSON,
                depType,
                depName,
                correctVersion,
              );
            }
          }
        }
      }
    }
  }

  // Update the "package.json" files to fix the discrepancies that we found above.
  if (!dryRun) {
    await Promise.all(
      [...pendingPackageJSONUpdates.entries()].map(
        async (packageJSONUpdate) => {
          const [packageName, tuple] = packageJSONUpdate;
          const [packageJSON, updatesArray] = tuple;

          for (const update of updatesArray) {
            const { depType, depName, newVersion } = update;
            const dependencies = packageJSON[depType];
            if (!isObject(dependencies)) {
              throw new Error(
                `The "package.json" file for "${packageName}" does not have a valid field for: ${depType}`,
              );
            }

            const oldVersion = dependencies[depName];
            dependencies[depName] = newVersion;

            console.log(
              `Updated "${packageName}": ${depName} - ${oldVersion} --> ${newVersion}`,
            );
          }

          const childPackageJSONPath = path.join(
            monorepoRoot,
            "packages",
            packageName,
            "package.json",
          );

          const packageJSONString = `${JSON.stringify(packageJSON, undefined, 2)}\n`; // Prettify it.
          await writeFile(childPackageJSONPath, packageJSONString);
        },
      ),
    );
  }

  return valid;
}

async function getMonorepoChildPackageJSONMap(
  monorepoRoot: string,
  monorepoPackageNames: readonly string[],
): Promise<ReadonlyMap<string, ReadonlyRecord<string, unknown>>> {
  const childPackageJSONs = await Promise.all(
    monorepoPackageNames.map(async (monorepoPackageName) => {
      const childPackagePath = path.join(
        monorepoRoot,
        "packages",
        monorepoPackageName,
      );

      const childPackageJSONPath = path.join(childPackagePath, "package.json");
      const childPackageJSONExists = await isFile(childPackageJSONPath);
      if (!childPackageJSONExists) {
        return undefined;
      }

      return await getPackageJSON(childPackagePath);
    }),
  );

  const childPackageJSONsMap = new Map<
    string,
    ReadonlyRecord<string, unknown>
  >();

  for (const [i, packageName] of monorepoPackageNames.entries()) {
    const packageJSON = childPackageJSONs[i];
    if (packageJSON !== undefined) {
      childPackageJSONsMap.set(packageName, packageJSON);
    }
  }

  return childPackageJSONsMap;
}

function isAllMonorepoDepsUsed(
  monorepoDependencies: ReadonlyRecord<string, unknown>,
  childPackageJSONMap: ReadonlyMap<string, ReadonlyRecord<string, unknown>>,
): boolean {
  // First, create a set of every dependency that is being used by all child packages.
  const usedDependencies = new Set<string>();

  for (const childPackageJSON of childPackageJSONMap.values()) {
    for (const dependencyType of DEPENDENCY_TYPES_TO_CHECK) {
      const dependencies = childPackageJSON[dependencyType];
      if (!isObject(dependencies)) {
        continue;
      }

      for (const depName of Object.keys(dependencies)) {
        usedDependencies.add(depName);
      }
    }
  }

  // Second, use the set to check for unused dependencies.
  let allDepsUsed = true;
  for (const depName of Object.keys(monorepoDependencies)) {
    if (!usedDependencies.has(depName)) {
      allDepsUsed = false;
      console.error(`Monorepo dependency is unused: ${depName}`);
    }
  }

  return allDepsUsed;
}

function addPendingUpdate(
  // eslint-disable-next-line complete/prefer-readonly-parameter-types
  pendingPackageJSONUpdates: PendingPackageJSONUpdates,
  packageName: string,
  packageJSON: ReadonlyRecord<string, unknown>,
  depType: DepType,
  depName: string,
  newVersion: string,
) {
  let tuple = pendingPackageJSONUpdates.get(packageName);
  if (tuple === undefined) {
    tuple = [packageJSON, []];
    pendingPackageJSONUpdates.set(packageName, tuple);
  }

  const updatesArray = tuple[1];
  const update = { depType, depName, newVersion };
  updatesArray.push(update);
}
