import type { ReadonlyRecord } from "complete-common";
import { assertDefined, isObject, trimPrefix } from "complete-common";
import path from "node:path";
import { dirOfCaller, findPackageRoot } from "./arkType.js";
import {
  getFileNamesInDirectoryAsync,
  isDirectoryAsync,
  isFileAsync,
} from "./file.js";
import {
  getPackageJSONAsync,
  setPackageJSONDependencyAsync,
} from "./packageJSON.js";
import { updatePackageJSONDependencies } from "./update.js";

/**
 * The keys are the package names. The values are the objects from the parsed "package.json" files.
 */
type PackageJSONMap = ReadonlyMap<string, ReadonlyRecord<string, unknown>>;

const DEPENDENCY_TYPES_TO_CHECK = ["dependencies", "devDependencies"] as const;

/**
 * Helper function to check if all of the dependencies in the monorepo "package.json" files are up
 * to date.
 *
 * This is intended to be called in a monorepo lint script. It will exit the program with an error
 * code of 1 if discrepancies are found.
 *
 * This function attempts to find the monorepo root directory automatically based on searching
 * backwards from the file of the calling function.
 */
export async function lintMonorepoPackageJSONs(): Promise<void> {
  const fromDir = dirOfCaller();
  const monorepoRoot = findPackageRoot(fromDir);
  const filesUpdated = await updatePackageJSONDependenciesMonorepoChildren(
    monorepoRoot,
    true,
  );
  if (filesUpdated) {
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
 * @param monorepoRoot Optional. If specified, automatic monorepo root detection will be skipped.
 * @returns Whether one or more "package.json" files were updated.
 */
export async function updatePackageJSONDependenciesMonorepo(
  monorepoRoot?: string,
): Promise<boolean> {
  if (monorepoRoot === undefined) {
    const fromDir = dirOfCaller();
    monorepoRoot = findPackageRoot(fromDir); // eslint-disable-line no-param-reassign
  }

  // First, update the main "package.json" at the root of the monorepo.
  const monorepoPackageJSONChanged =
    updatePackageJSONDependencies(monorepoRoot);

  // Second, check to see if child "package.json" dependencies are up to date.
  const childPackageJSONChanged =
    await updatePackageJSONDependenciesMonorepoChildren(monorepoRoot);

  return monorepoPackageJSONChanged || childPackageJSONChanged;
}

/**
 * Helper function to only update the dependencies in the "package.json" files of the sub-packages
 * of a monorepo.
 *
 * This will update both the normal dependencies (to match what is in the monorepo root
 * "package.json") and the monorepo dependencies (to be what is listed in the "version" field of the
 * respective "package.json" file).
 *
 * If you need to check this in a lint script, then use the `lintMonorepoPackageJSONs` function
 * instead.
 *
 * @param monorepoRoot The full path to the monorepo root directory.
 * @param dryRun Optional. If true, will not modify the "package.json" files. Defaults to false.
 * @returns Whether one or more "package.json" files were updated.
 */
export async function updatePackageJSONDependenciesMonorepoChildren(
  monorepoRoot: string,
  dryRun = false,
): Promise<boolean> {
  // First, get and validate the root monorepo "package.json" file.
  const monorepoPackageJSON = await getPackageJSONAsync(monorepoRoot);

  const monorepoDependencies = monorepoPackageJSON["dependencies"];
  assertDefined(
    monorepoDependencies,
    `The "${monorepoRoot}/package.json" file does not have a "dependencies" field.`,
  );
  if (!isObject(monorepoDependencies)) {
    throw new Error(
      `The "${monorepoRoot}/package.json" has a "dependencies" field that is not an object.`,
    );
  }

  const monorepoDevDependencies = monorepoPackageJSON["devDependencies"];
  if (monorepoDevDependencies !== undefined) {
    throw new Error(
      `The "${monorepoRoot}/package.json" file has a "devDependencies" field. This is incorrect because a monorepo should only have normal dependencies.`,
    );
  }

  const monorepoPeerDependencies = monorepoPackageJSON["peerDependencies"];
  if (monorepoPeerDependencies !== undefined) {
    throw new Error(
      `The "${monorepoRoot}/package.json" file has a "peerDependencies" field. This is incorrect because a monorepo should only have normal dependencies.`,
    );
  }

  // Second, get the child "package.json" files.
  const monorepoPackageNames = await getMonorepoPackageNames(monorepoRoot);
  const childPackageJSONMap = await getMonorepoChildPackageJSONMap(
    monorepoRoot,
    monorepoPackageNames,
  );

  // Third, validate the child "package.json" files.
  const promises: Array<Promise<unknown>> = [];

  for (const [childPackageName, childPackageJSON] of childPackageJSONMap) {
    const childPackageJSONPath = path.join(
      monorepoRoot,
      "packages",
      childPackageName,
      "package.json",
    );

    for (const dependencyType of DEPENDENCY_TYPES_TO_CHECK) {
      const childDependencies = childPackageJSON[dependencyType];
      if (!isObject(childDependencies)) {
        continue;
      }

      for (const [depName, depVersion] of Object.entries(childDependencies)) {
        if (typeof depVersion !== "string") {
          throw new TypeError(
            `Failed to parse the value of the dependency of: ${childPackageName} --> ${depName}`,
          );
        }

        const otherPackageJSON = childPackageJSONMap.get(depName);
        if (otherPackageJSON === undefined) {
          // This is not a monorepo package, so we have to look for the correct version in the root
          // monorepo "package.json" file.
          const monorepoVersion = monorepoDependencies[depName];
          if (typeof monorepoVersion !== "string") {
            throw new TypeError(
              `Failed to find the monorepo dependency of "${depName}" for package "${childPackageName}".`,
            );
          }

          if (depVersion !== monorepoVersion) {
            if (dryRun) {
              console.log(
                `A dependency is out of date in "${childPackageName}": ${depName} - ${depVersion} --> ${monorepoVersion}`,
              );
            } else {
              const promise = setPackageJSONDependencyAsync(
                childPackageJSONPath,
                depName,
                monorepoVersion,
                dependencyType,
              );
              promises.push(promise);
              console.log(
                `Updated "${childPackageName}": ${depName} - ${depVersion} --> ${monorepoVersion}`,
              );
            }
          }
        } else {
          // This is a monorepo package, so we have to look for the correct version in the
          // individual package's "package.json" file.
          const correctVersion = otherPackageJSON["version"];
          if (typeof correctVersion !== "string") {
            throw new TypeError(
              `Failed to parse the version for package: ${depName}`,
            );
          }

          const depVersionTrimmed = trimPrefix(depVersion, "^");
          if (depVersionTrimmed !== correctVersion) {
            const correctVersionWithPrefix = `^${correctVersion}`;
            if (dryRun) {
              console.log(
                `A dependency is out of date in "${childPackageName}": ${depName} - ${depVersion} --> ${correctVersionWithPrefix}`,
              );
            } else {
              const promise = setPackageJSONDependencyAsync(
                childPackageJSONPath,
                depName,
                correctVersionWithPrefix,
                dependencyType,
              );
              promises.push(promise);
              console.log(
                `Updated "${childPackageName}": ${depName} - ${depVersion} --> ${correctVersionWithPrefix}`,
              );
            }

            return true;
          }
        }
      }
    }
  }

  if (promises.length === 0) {
    return false;
  }

  await Promise.all(promises);
  return true;
}

/**
 * Helper function to asynchronously get the package names in a monorepo by looking at all of the
 * subdirectories in the "packages" directory.
 *
 * @param monorepoRoot The full path to the root of the monorepo.
 */
async function getMonorepoPackageNames(
  monorepoRoot: string,
): Promise<readonly string[]> {
  const packagesPath = path.join(monorepoRoot, "packages");
  const packagesPathExists = await isDirectoryAsync(packagesPath);
  if (!packagesPathExists) {
    throw new Error(
      `Failed to find the monorepo packages directory at: ${packagesPath}`,
    );
  }

  const fileNames = await getFileNamesInDirectoryAsync(packagesPath);
  const filePaths = fileNames.map((fileName) =>
    path.join(packagesPath, fileName),
  );
  const promises = filePaths.map(isDirectoryAsync);
  const directoryChecks = await Promise.all(promises);

  return fileNames.filter((_, i) => directoryChecks[i] === true);
}

async function getMonorepoChildPackageJSONMap(
  monorepoRoot: string,
  monorepoPackageNames: readonly string[],
): Promise<PackageJSONMap> {
  const promises = monorepoPackageNames.map(async (monorepoPackageName) => {
    const childPackagePath = path.join(
      monorepoRoot,
      "packages",
      monorepoPackageName,
    );

    const childPackageJSONPath = path.join(childPackagePath, "package.json");
    const childPackageJSONExists = await isFileAsync(childPackageJSONPath);
    if (!childPackageJSONExists) {
      return undefined;
    }

    const childPackageJSON = await getPackageJSONAsync(childPackagePath);

    return childPackageJSON;
  });

  const childPackageJSONs = await Promise.all(promises);

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
