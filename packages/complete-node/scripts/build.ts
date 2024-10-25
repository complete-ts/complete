import { trimSuffix } from "complete-common";
import {
  $s,
  buildScript,
  copyFileOrDirectory,
  copyFileOrDirectoryAsync,
  deleteFileOrDirectory,
  fixMonorepoPackageDistDirectory,
  getMatchingFilePaths,
  readFileAsync,
  writeFileAsync,
} from "complete-node";
import os from "node:os";
import path from "node:path";

const OUTPUT_FILES = ["index.cjs", "index.mjs"] as const;

await buildScript(async (packageRoot) => {
  $s`unbuild`; // We use the `unbuild` library to output both ESM and CJS.
  await buildDeclarationMaps(packageRoot);
});

/**
 * `unbuild` does not generate declaration maps, so we must use `tsc` to generate that. However,
 * first we move the unbuild output to a temporary directory so that it does not get overwritten.
 * (It is not possible to configure `unbuild` to disable declarations, since reading the
 * configuration file is bugged.)
 */
async function buildDeclarationMaps(packageRoot: string) {
  const outDir = path.join(packageRoot, "dist");
  const tmpDir = os.tmpdir();

  for (const fileName of OUTPUT_FILES) {
    const srcPath = path.join(outDir, fileName);
    const dstPath = path.join(tmpDir, fileName);
    copyFileOrDirectory(srcPath, dstPath);
    deleteFileOrDirectory(srcPath);
  }

  deleteFileOrDirectory(outDir);
  $s`tsc --emitDeclarationOnly`;
  fixMonorepoPackageDistDirectory(packageRoot);
  await fixDeclarationMaps(outDir);
  await copyDeclarations(outDir);

  for (const fileName of OUTPUT_FILES) {
    const srcPath = path.join(tmpDir, fileName);
    const dstPath = path.join(outDir, fileName);
    copyFileOrDirectory(srcPath, dstPath);
    deleteFileOrDirectory(srcPath);
  }
}

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
async function fixDeclarationMaps(outDir: string): Promise<void> {
  const extension = ".d.ts.map";
  const matchFunc = (filePath: string) => filePath.endsWith(extension);
  const filePaths = await getMatchingFilePaths(outDir, matchFunc);
  const filesContents = await Promise.all(
    filePaths.map(async (filePath) => readFileAsync(filePath)),
  );
  await Promise.all(
    filePaths.map(async (filePath, i) => {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const fileContents = filesContents[i]!;
      const newFileContents = fileContents.replaceAll("../../src/", "src/");
      return writeFileAsync(filePath, newFileContents);
    }),
  );
}

/** By default, TypeScript creates ".d.ts" files, but we need both ".d.cts" and ".d.mts" files. */
async function copyDeclarations(outDir: string) {
  const extension = ".d.ts";
  const matchFunc = (filePath: string) => filePath.endsWith(extension);
  const filePaths = await getMatchingFilePaths(outDir, matchFunc);

  const promises: Array<Promise<void>> = [];
  for (const filePath of filePaths) {
    for (const newExtension of [".d.cts", ".d.mts"]) {
      const newPath = trimSuffix(filePath, ".d.ts") + newExtension;
      const promise = copyFileOrDirectoryAsync(filePath, newPath);
      promises.push(promise);
    }
  }
  await Promise.all(promises);

  // We do not need to create "index.d.cts.map" or "index.d.mts.map" files, because they already
  // point to "index.d.ts.map".
}
