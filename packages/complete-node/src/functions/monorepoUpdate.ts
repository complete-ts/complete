import { assertDefined, trimPrefix } from "complete-common";
import path from "node:path";
import { dirOfCaller, findPackageRoot } from "./arkType.js";
import { isFile } from "./file.js";
import { getMonorepoPackageNames } from "./monorepo.js";
import {
  getPackageJSONDependencies,
  getPackageJSONField,
  setPackageJSONDependency,
} from "./packageJSON.js";
import { updatePackageJSONDependencies } from "./update.js";

/**
 * Helper function to update the dependencies in all of the monorepo "package.json" files. If there
 * are any updates, the package manager used in the project will be automatically invoked.
 *
 * @returns Whether one or more "package.json" files were updated.
 */
export function updatePackageJSONDependenciesMonorepo(): boolean {
  const fromDir = dirOfCaller();
  const monorepoRoot = findPackageRoot(fromDir);

  // First, update the main "package.json" at the root of the monorepo.
  const monorepoPackageJSONChanged =
    updatePackageJSONDependencies(monorepoRoot);

  // Second, check to see if child "package.json" dependencies are up to date.
  const childPackageJSONChanged = updateChild(monorepoRoot);

  return monorepoPackageJSONChanged || childPackageJSONChanged;
}

/** @returns Whether one or more "package.json" files were updated. */
function updateChild(monorepoRoot: string): boolean {
  const monorepoPackageNames = getMonorepoPackageNames(monorepoRoot);

  // First, check to see if child packages match the dependencies at the root of the monorepo.
  const normalDepsUpdated = updateChildNormalDependencies(
    monorepoRoot,
    monorepoPackageNames,
  );

  // Third, check to see if child packages that depend on monorepo packages match the versions from
  // those package's "package.json" files.
  const monorepoDepsUpdated = updateChildMonorepoDependencies(
    monorepoRoot,
    monorepoPackageNames,
  );

  return normalDepsUpdated || monorepoDepsUpdated;
}

/** @returns Whether one or more "package.json" files were updated. */
function updateChildNormalDependencies(
  monorepoRoot: string,
  monorepoPackageNames: readonly string[],
): boolean {
  let updatedSomething = false;

  const monorepoDependencies = getPackageJSONDependencies(monorepoRoot);
  assertDefined(
    monorepoDependencies,
    "Failed to get the dependencies at the root of the monorepo.",
  );

  for (const monorepoPackageName of monorepoPackageNames) {
    const childPackagePath = path.join(
      monorepoRoot,
      "packages",
      monorepoPackageName,
    );

    const childPackageJSONPath = path.join(childPackagePath, "package.json");
    if (!isFile(childPackageJSONPath)) {
      continue;
    }

    for (const dependencyType of ["dependencies", "devDependencies"] as const) {
      const childDependencies = getPackageJSONDependencies(
        childPackagePath,
        dependencyType,
      );
      if (childDependencies === undefined) {
        continue;
      }

      for (const [dependencyName, dependencyVersion] of Object.entries(
        childDependencies,
      )) {
        const monorepoDependencyVersion = monorepoDependencies[dependencyName];
        if (monorepoDependencyVersion === undefined) {
          throw new Error(
            `Failed to find the following dependency at the root of the monorepo: ${dependencyName}`,
          );
        }

        if (dependencyVersion !== monorepoDependencyVersion) {
          setPackageJSONDependency(
            childPackageJSONPath,
            dependencyName,
            monorepoDependencyVersion,
            dependencyType,
          );
          updatedSomething = true;
        }
      }
    }
  }

  return updatedSomething;
}

/** @returns Whether one or more "package.json" files were updated. */
function updateChildMonorepoDependencies(
  monorepoRoot: string,
  monorepoPackageNames: readonly string[],
): boolean {
  let updatedSomething = false;

  for (const monorepoPackageName of monorepoPackageNames) {
    const childPackagePath = path.join(
      monorepoRoot,
      "packages",
      monorepoPackageName,
    );

    const childPackageJSONPath = path.join(childPackagePath, "package.json");
    if (!isFile(childPackageJSONPath)) {
      continue;
    }

    const correctVersion = getPackageJSONField(childPackageJSONPath, "version");
    if (correctVersion === undefined) {
      continue;
    }

    for (const monorepoPackageName2 of monorepoPackageNames) {
      const childPackagePath2 = path.join(
        monorepoRoot,
        "packages",
        monorepoPackageName2,
      );

      const childPackageJSONPath2 = path.join(
        childPackagePath2,
        "package.json",
      );
      if (!isFile(childPackageJSONPath2)) {
        continue;
      }

      const dependencies = getPackageJSONDependencies(
        childPackagePath2,
        "dependencies",
      );
      if (dependencies === undefined) {
        continue;
      }

      const depVersion = dependencies[monorepoPackageName];
      if (depVersion === undefined) {
        continue;
      }

      const depVersionTrimmed = trimPrefix(depVersion, "^");

      if (depVersionTrimmed !== correctVersion) {
        const versionWithPrefix = `^${correctVersion}`;
        setPackageJSONDependency(
          childPackagePath2,
          monorepoPackageName,
          versionWithPrefix,
        );
        updatedSomething = true;
      }
    }
  }

  return updatedSomething;
}
