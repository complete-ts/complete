import path from "node:path";
import { dirOfCaller, findPackageRoot } from "./arkType.js";
import {
  copyFileOrDirectory,
  deleteFileOrDirectory,
  getFileNamesInDirectory,
  isDirectory,
  isFile,
} from "./file.js";
import { packageJSONHasScript } from "./packageJSON.js";

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
 */
export function getMonorepoPackageNames(
  scriptName?: string,
): readonly string[] {
  const fromDir = dirOfCaller();
  const monorepoRoot = findPackageRoot(fromDir);
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
