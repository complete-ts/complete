/**
 * Helper functions for working with [monorepos](https://monorepo.tools/).
 *
 * @module
 */

import { assertDefined } from "complete-common";
import path from "node:path";
import {
  copyFileOrDirectory,
  deleteFileOrDirectory,
  getFileNamesInDirectory,
  getFilePathsInDirectory,
  isDirectory,
  isFile,
  moveFileOrDirectory,
} from "./file.js";
import { packageJSONHasScript } from "./packageJSON.js";
import { readFile, writeFile } from "./readWrite.js";

/**
 * Helper function to copy a package's build output to the "node_modules" directory at the root of
 * the monorepo. This obviates the need for the monorepo to consume the actual npm package. (This is
 * useful for ESLint plugins inside of a monorepo, for example.)
 *
 * This function assumes that the monorepo root is two directories above the provided package root.
 */
export async function copyToMonorepoNodeModules(
  packageRoot: string,
): Promise<void> {
  const monorepoRoot = path.resolve(packageRoot, "..", "..");
  const packageName = path.basename(packageRoot);
  const monorepoNodeModulesPath = path.join(monorepoRoot, "node_modules");

  const nodeModulesExists = await isDirectory(monorepoNodeModulesPath);
  if (!nodeModulesExists) {
    throw new Error(
      `Failed to find the monorepo "node_modules" directory at: ${monorepoNodeModulesPath}`,
    );
  }

  const destinationPath = path.join(monorepoNodeModulesPath, packageName);
  await deleteFileOrDirectory(destinationPath);
  await copyFileOrDirectory(packageRoot, destinationPath);
}

/**
 * In a monorepo without project references, `tsc` will compile parent projects and include it in
 * the build output, making a weird directory structure. Since build output for a single package
 * should not be include other monorepo dependencies inside of it, all of the output needs to be
 * deleted except for the actual package output.
 *
 * This function assumes an "outDir" of "dist".
 */
export async function fixMonorepoPackageDistDirectory(
  packageRoot: string,
): Promise<void> {
  const projectName = path.basename(packageRoot);
  const outDir = path.join(packageRoot, "dist");
  const realOutDir = path.join(outDir, projectName, "src");
  const tempPath = path.join(packageRoot, projectName);
  await deleteFileOrDirectory(tempPath);
  await moveFileOrDirectory(realOutDir, tempPath);
  await deleteFileOrDirectory(outDir);
  await moveFileOrDirectory(tempPath, outDir);

  /**
   * After moving the declaration map files to a different directory, the relative path to the "src"
   * directory will be broken.
   *
   * For example:
   *
   * ```json
   * {"version":3,"file":"index.d.ts","sourceRoot":"","sources":["../../../src/index.ts"]
   * ```
   *
   * Needs to be rewritten to:
   *
   * ```json
   * {"version":3,"file":"index.d.ts","sourceRoot":"","sources":["../src/index.ts"]
   * ```
   */
  const extension = ".d.ts.map";
  const filePaths = await getFilePathsInDirectory(outDir, "files", true);
  const filePathsWithExtension = filePaths.filter((filePath) =>
    filePath.endsWith(extension),
  );
  const filesContents = await Promise.all(
    filePathsWithExtension.map(async (filePath) => await readFile(filePath)),
  );
  await Promise.all(
    filePathsWithExtension.map(async (filePath, i) => {
      const fileContents = filesContents[i];
      assertDefined(
        fileContents,
        `Failed to get the file contents at index: ${i}`,
      );
      const newFileContents = fileContents.replaceAll("../../src/", "src/");
      await writeFile(filePath, newFileContents);
    }),
  );
}

/**
 * Helper function to asynchronously get the package names in a monorepo by looking at all of the
 * subdirectories in the "packages" directory.
 *
 * @param monorepoRoot The full path to the root of the monorepo.
 * @param scriptName Optional. If specified, the package names will be filtered to only include
 *                   those that include scripts with the given name.
 */
export async function getMonorepoPackageNames(
  monorepoRoot: string,
  scriptName?: string,
): Promise<readonly string[]> {
  const packagesPath = path.join(monorepoRoot, "packages");
  const packagesPathExists = await isDirectory(packagesPath);
  if (!packagesPathExists) {
    throw new Error(
      `Failed to find the monorepo packages directory at: ${packagesPath}`,
    );
  }

  const directoryNames = await getFileNamesInDirectory(
    packagesPath,
    "directories",
  );

  if (scriptName === undefined || scriptName === "") {
    return directoryNames;
  }

  const hasScriptPromises = directoryNames.map(async (directoryName) => {
    const packageJSONPath = path.join(
      packagesPath,
      directoryName,
      "package.json",
    );
    const exists = await isFile(packageJSONPath);
    return exists
      ? await packageJSONHasScript(packageJSONPath, scriptName)
      : false;
  });

  const hasScript = await Promise.all(hasScriptPromises);
  return directoryNames.filter((_package, i) => hasScript[i] === true);
}
