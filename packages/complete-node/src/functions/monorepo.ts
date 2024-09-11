import path from "node:path";
import {
  copyFileOrDirectory,
  deleteFileOrDirectory,
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
 *
 * This function will assume an "outDir" of "dist".
 */
export function fixMonorepoPackageDistDirectory(packageRoot: string): void {
  const projectName = path.basename(packageRoot);
  const outDir = path.join(packageRoot, "dist");
  const realOutDir = path.join(outDir, projectName, "src");
  const tempPath = path.join(packageRoot, projectName);
  deleteFileOrDirectory(tempPath);
  moveFile(realOutDir, tempPath);
  deleteFileOrDirectory(outDir);
  moveFile(tempPath, outDir);
}
