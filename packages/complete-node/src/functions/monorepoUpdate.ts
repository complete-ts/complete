import { assertDefined, trimPrefix } from "complete-common";
import path from "node:path";
import { dirOfCaller, findPackageRoot } from "./arkType.js";
import {
  getFileNamesInDirectoryAsync,
  isDirectoryAsync,
  isFileAsync,
} from "./file.js";
import {
  getPackageJSONDependenciesAsync,
  getPackageJSONFieldAsync,
  setPackageJSONDependencyAsync,
} from "./packageJSON.js";
import { updatePackageJSONDependencies } from "./update.js";

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
  const monorepoPackageNames = await getMonorepoPackageNames(monorepoRoot);

  // First, check to see if child packages match the dependencies at the root of the monorepo.
  const normalDepsUpdated = await updateChildNormalDependencies(
    monorepoRoot,
    monorepoPackageNames,
    dryRun,
  );

  // Third, check to see if child packages that depend on monorepo packages match the versions from
  // those package's "package.json" files.
  const monorepoDepsUpdated = await updateChildMonorepoDependencies(
    monorepoRoot,
    monorepoPackageNames,
    dryRun,
  );

  return normalDepsUpdated || monorepoDepsUpdated;
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

/** @returns Whether one or more "package.json" files were updated. */
async function updateChildNormalDependencies(
  monorepoRoot: string,
  monorepoPackageNames: readonly string[],
  dryRun: boolean,
): Promise<boolean> {
  const monorepoDependencies =
    await getPackageJSONDependenciesAsync(monorepoRoot);
  assertDefined(
    monorepoDependencies,
    "Failed to get the dependencies at the root of the monorepo.",
  );

  const promises = monorepoPackageNames.map(async (monorepoPackageName) => {
    const childPackagePath = path.join(
      monorepoRoot,
      "packages",
      monorepoPackageName,
    );

    const childPackageJSONPath = path.join(childPackagePath, "package.json");
    const childPackageJSONExists = await isFileAsync(childPackageJSONPath);
    if (!childPackageJSONExists) {
      return false;
    }

    const promises2 = DEPENDENCY_TYPES_TO_CHECK.map(async (dependencyType) => {
      const childDependencies = await getPackageJSONDependenciesAsync(
        childPackagePath,
        dependencyType,
      );
      if (childDependencies === undefined) {
        return false;
      }

      const promises3 = Object.entries(childDependencies)
        .filter(
          ([dependencyName]) => !monorepoPackageNames.includes(dependencyName),
        )
        .map(async ([dependencyName, dependencyVersion]) => {
          const monorepoDependencyVersion =
            monorepoDependencies[dependencyName];
          assertDefined(
            monorepoDependencyVersion,
            `Failed to find the following dependency at the root of the monorepo: ${dependencyName}`,
          );

          if (dependencyVersion !== monorepoDependencyVersion) {
            if (dryRun) {
              console.log(
                `A dependency is out of date in "${childPackageJSONPath}": ${dependencyName} - ${dependencyVersion} --> ${monorepoDependencyVersion}`,
              );
            } else {
              await setPackageJSONDependencyAsync(
                childPackageJSONPath,
                dependencyName,
                monorepoDependencyVersion,
                dependencyType,
              );
              console.log(
                `Updated "${childPackageJSONPath}": ${dependencyName} - ${dependencyVersion} --> ${monorepoDependencyVersion}`,
              );
            }

            return true;
          }

          return false;
        });

      const results = await Promise.all(promises3);
      return results.some(Boolean); // Cannot use ".includes" or else it will early return.
    });

    const results = await Promise.all(promises2);
    return results.some(Boolean); // Cannot use ".includes" or else it will early return.
  });

  const results = await Promise.all(promises);
  return results.some(Boolean); // Cannot use ".includes" or else it will early return.
}

/** @returns Whether one or more "package.json" files were updated. */
async function updateChildMonorepoDependencies(
  monorepoRoot: string,
  monorepoPackageNames: readonly string[],
  dryRun: boolean,
): Promise<boolean> {
  const promises = monorepoPackageNames.map(async (monorepoPackageName) => {
    const childPackagePath = path.join(
      monorepoRoot,
      "packages",
      monorepoPackageName,
    );

    const childPackageJSONPath = path.join(childPackagePath, "package.json");
    const childPackageJSONExists = await isFileAsync(childPackageJSONPath);
    if (!childPackageJSONExists) {
      return false;
    }

    const correctVersion = await getPackageJSONFieldAsync(
      childPackageJSONPath,
      "version",
    );
    if (correctVersion === undefined) {
      return false;
    }

    const promises2 = monorepoPackageNames.map(async (monorepoPackageName2) => {
      const childPackagePath2 = path.join(
        monorepoRoot,
        "packages",
        monorepoPackageName2,
      );

      const childPackageJSONPath2 = path.join(
        childPackagePath2,
        "package.json",
      );
      const childPackageJSONExists2 = await isFileAsync(childPackageJSONPath2);
      if (!childPackageJSONExists2) {
        return false;
      }

      const dependencies = await getPackageJSONDependenciesAsync(
        childPackagePath2,
        "dependencies",
      );
      if (dependencies === undefined) {
        return false;
      }

      const depVersion = dependencies[monorepoPackageName];
      if (depVersion === undefined) {
        return false;
      }

      const depVersionTrimmed = trimPrefix(depVersion, "^");

      if (depVersionTrimmed !== correctVersion) {
        if (dryRun) {
          console.log(
            `A dependency is out of date in "${childPackageJSONPath}": ${monorepoPackageName} - ${depVersionTrimmed} --> ${correctVersion}`,
          );
        } else {
          const versionWithPrefix = `^${correctVersion}`;
          await setPackageJSONDependencyAsync(
            childPackagePath2,
            monorepoPackageName,
            versionWithPrefix,
          );
          console.log(
            `Updated "${childPackageJSONPath}": ${monorepoPackageName} - ${depVersionTrimmed} --> ${correctVersion}`,
          );
        }

        return true;
      }

      return false;
    });

    const results = await Promise.all(promises2);
    return results.some(Boolean); // Cannot use ".includes" or else it will early return.
  });

  const results = await Promise.all(promises);
  return results.some(Boolean); // Cannot use ".includes" or else it will early return.
}
