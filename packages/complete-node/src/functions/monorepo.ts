import { trimPrefix } from "complete-common";
import path from "node:path";
import { dirOfCaller, findPackageRoot } from "./arkType.js";
import {
  copyFileOrDirectory,
  deleteFileOrDirectory,
  getFileNamesInDirectory,
  isDirectory,
  isFile,
} from "./file.js";
import {
  getPackageJSONDependencies,
  getPackageJSONField,
  packageJSONHasScript,
  setPackageJSONDependency,
} from "./packageJSON.js";

/**
 * Helper function to copy a package's build output to the "node_modules" folder at the root of the
 * monorepo. This obviates the need for the monorepo to consume the actual npm package. (This is
 * useful for ESLint plugins inside of a monorepo, for example.)
 */
export function copyToMonorepoNodeModules(packageRoot: string): void {
  const monorepoRoot = path.join(packageRoot, "..", "..");
  const packageName = path.basename(packageRoot);
  const monorepoNodeModulesPath = path.join(monorepoRoot, "node_modules");

  if (!isDirectory(monorepoNodeModulesPath)) {
    throw new Error(
      `Failed to find the monorepo "node_modules" directory at: ${monorepoNodeModulesPath}`,
    );
  }

  const destinationPath = path.join(monorepoNodeModulesPath, packageName);
  deleteFileOrDirectory(destinationPath);
  copyFileOrDirectory(packageRoot, destinationPath);
}

/**
 * Helper function to get the package names in a monorepo by looking at all of the subdirectories in
 * the "packages" directory.
 *
 * @param scriptName Optional. If specified, the package names will be filtered to only include
 *                   those that include scripts with the given name.
 * @param fromDir Optional. The directory to start looking for the "package.json" file. Default is
 *                the directory of the calling function.
 */
export function getMonorepoPackageNames(
  scriptName?: string,
  fromDir?: string,
): readonly string[] {
  const fromDirToUse = fromDir ?? dirOfCaller();
  const monorepoRoot = findPackageRoot(fromDirToUse);
  const packagesPath = path.join(monorepoRoot, "packages");
  if (!isDirectory(packagesPath)) {
    throw new Error(
      `The monorepo packages directory does not exist at: ${packagesPath}`,
    );
  }

  const packageNames: string[] = [];

  const fileNames = getFileNamesInDirectory(packagesPath);
  for (const fileName of fileNames) {
    const filePath = path.join(packagesPath, fileName);
    if (isDirectory(filePath)) {
      packageNames.push(fileName);
    }
  }

  if (scriptName === undefined || scriptName === "") {
    return packageNames;
  }

  return packageNames.filter((packageName) => {
    const packageJSONPath = path.join(
      packagesPath,
      packageName,
      "package.json",
    );
    if (!isFile(packageJSONPath)) {
      return false;
    }

    return packageJSONHasScript(packageJSONPath, scriptName);
  });
}

/** @returns Whether anything was updated. */
export function updateMonorepoSelfDependencies(): boolean {
  const fromDir = dirOfCaller();
  const monorepoRoot = findPackageRoot(fromDir);

  let updatedSomething = false;

  const monorepoPackageNames = getMonorepoPackageNames(undefined, monorepoRoot);
  for (const monorepoPackageName of monorepoPackageNames) {
    const monorepoPackagePath = path.join(
      monorepoRoot,
      "packages",
      monorepoPackageName,
    );

    const packageJSONPath = path.join(monorepoPackagePath, "package.json");
    if (!isFile(packageJSONPath)) {
      continue;
    }

    const version = getPackageJSONField(packageJSONPath, "version");
    if (version === undefined) {
      continue;
    }

    for (const monorepoPackageName2 of monorepoPackageNames) {
      const monorepoPackagePath2 = path.join(
        monorepoRoot,
        "packages",
        monorepoPackageName2,
      );

      const packageJSONPath2 = path.join(monorepoPackagePath2, "package.json");
      if (!isFile(packageJSONPath2)) {
        continue;
      }

      const dependencies = getPackageJSONDependencies(
        monorepoPackagePath2,
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

      if (depVersionTrimmed !== version) {
        const versionWithPrefix = `^${version}`;
        setPackageJSONDependency(
          monorepoPackagePath2,
          monorepoPackageName,
          versionWithPrefix,
        );
        updatedSomething = true;
      }
    }
  }

  return updatedSomething;
}
