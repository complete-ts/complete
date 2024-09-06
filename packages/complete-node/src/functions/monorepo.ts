import path from "node:path";
import {
  copyFileOrDirectory,
  deleteFileOrDirectory,
  getFileNamesInDirectory,
  isDirectory,
  moveFile,
} from "./file.js";

/**
 * Helper function to copy a package's build output to the "node_modules" folder at the root of the
 * monorepo. This obviates the need for the monorepo to consume the actual npm package. (This is
 * useful for ESLint plugins inside of a monorepo, for example.)
 *
 * This function assumes that the monorepo root is two directories above the provided package root.
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
 * @param monorepoRoot The full path to the root of the monorepo.
 */
export function getMonorepoPackageNames(
  monorepoRoot: string,
): readonly string[] {
  const packagesPath = path.join(monorepoRoot, "packages");
  if (!isDirectory(packagesPath)) {
    throw new Error(
      `Failed to find the monorepo packages directory at: ${packagesPath}`,
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

  return packageNames;
}
