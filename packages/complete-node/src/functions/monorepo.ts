import { trimPrefix } from "complete-common";
import path from "node:path";
import { dirOfCaller, findPackageRoot } from "./arkType.js";
import {
  copyFileOrDirectory,
  deleteFileOrDirectory,
  getFileNamesInDirectory,
  isDirectory,
  isFile,
  moveFile,
} from "./file.js";
import {
  getPackageJSONDependencies,
  getPackageJSONField,
  packageJSONHasScript,
  setPackageJSONDependency,
} from "./packageJSON.js";

/**
 * Helper function to check all of the "package.json" files in a monorepo to see if the dependencies
 * are up to date.
 *
 * @returns Whether all the "package.json" files were valid.
 */
export function checkMonorepoPackageJSONs(): boolean {
  return false;
}

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
 * In a monorepo without project references, `tsc` will compile parent projects and include it in
 * the build output, making a weird directory structure. Since build output for a single package
 * should not be include other monorepo dependencies inside of it, all of the output needs to be
 * deleted except for the actual package output.
 */
export function fixMonorepoPackageDistDirectory(
  packageRoot: string,
  outDir: string,
): void {
  const projectName = path.basename(packageRoot);
  const realOutDir = path.join(outDir, projectName, "src");
  const tempPath = path.join(packageRoot, projectName);
  deleteFileOrDirectory(tempPath);
  moveFile(realOutDir, tempPath);
  deleteFileOrDirectory(outDir);
  moveFile(tempPath, outDir);
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

/*
export function updateMonorepo(): void {
  const hasNewDependencies = updatePackageJSON(REPO_ROOT);
  if (hasNewDependencies) {
    // Now that the main dependencies have changed, we might need to update the "package.json" files
    // in the individual packages. However, we don't want to blow away "peerDependencies", since
    // they are in the form of ">= 5.0.0". Thus, we specify "--types prod,dev" to exclude syncing
    // "peerDependencies".
    $s`syncpack fix-mismatches --types prod,dev`;
  }

  // Certain monorepo packages are dependant on other monorepo packages, so check to see if those
  // are all up to date first. (This is independent of the root "package.json" file.)
  const updatedSelfDependencies = updateMonorepoSelfDependencies();

  if (updatedSelfDependencies || hasNewDependencies) {
    echo("Updated to the latest dependencies.");
  } else {
    echo("No new updates.");
  }
}
*/
/** Helper function to update all of the dependencies in the monorepo "package.json" files. */
export function updateMonorepoPackageJSONs(): boolean {
  // TODO
  return false;
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
