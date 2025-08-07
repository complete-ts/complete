import { assertDefined, trimSuffix } from "complete-common";
import {
  $,
  buildScript,
  copyFileOrDirectory,
  deleteFileOrDirectory,
  fixMonorepoPackageDistDirectory,
  getFilePathsInDirectory,
  readTextFile,
  replaceTextInFile,
} from "complete-node";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";

await buildScript(async (packageRoot) => {
  await unbuild(packageRoot);
});

/** We use the `unbuild` library to output both ESM and CJS. */
export async function unbuild(packageRoot: string): Promise<void> {
  // Running `unbuild` will create the following files:
  // - index.cjs
  // - index.d.cts
  // - index.d.mts
  // - index.d.ts
  // - index.mjs
  await $`unbuild`;

  await fixBuggedReadonlyConstructors();
  await buildDeclarations(packageRoot);
  await copyDeclarations(packageRoot);
}

/**
 * For some reason `unbuild` (and `tsup`) will append a "$1" to the `ReadonlyMap` and `ReadonlySet`
 * constructors in the "complete-common" library. Thus, we must manually fix this.
 */
async function fixBuggedReadonlyConstructors() {
  await removeBuggedTypeSuffix("Map");
  await removeBuggedTypeSuffix("Set");
}

async function removeBuggedTypeSuffix(typeName: string) {
  const searchValue = `Readonly${typeName}$1`;
  const replaceValue = `Readonly${typeName}`;

  await Promise.all(
    ["ts", "mts", "cts"].map(async (extension) => {
      const filePath = path.join("dist", `index.d.${extension}`);
      await replaceTextInFile(filePath, searchValue, replaceValue);
    }),
  );
}

/**
 * `unbuild` does not generate declaration maps, so we must use `tsc` to generate that. However,
 * first we move the unbuild output to a temporary directory so that it does not get overwritten.
 * (It is not possible to configure `unbuild` to disable declarations, since reading the
 * configuration file is bugged.)
 */
async function buildDeclarations(packageRoot: string) {
  const outDir = path.join(packageRoot, "dist");
  const tmpDir = os.tmpdir();

  const javaScriptFileNames = ["index.cjs", "index.mjs"] as const;

  // Move the JavaScript files to a temporary directory.
  await Promise.all(
    javaScriptFileNames.map(async (fileName) => {
      const srcPath = path.join(outDir, fileName);
      const dstPath = path.join(tmpDir, fileName);
      await fs.rename(srcPath, dstPath);
    }),
  );

  await deleteFileOrDirectory(outDir);
  await $`tsc --emitDeclarationOnly`;
  await fixMonorepoPackageDistDirectory(packageRoot);
  await fixDeclarationMaps(outDir);

  // Move the JavaScript files back.
  await Promise.all(
    javaScriptFileNames.map(async (fileName) => {
      const srcPath = path.join(tmpDir, fileName);
      const dstPath = path.join(outDir, fileName);
      await fs.rename(srcPath, dstPath);
    }),
  );
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
async function fixDeclarationMaps(outDir: string) {
  const extension = ".d.ts.map";
  const filePaths = await getFilePathsInDirectory(outDir, "files", true);
  const filePathsWithExtension = filePaths.filter((filePath) =>
    filePath.endsWith(extension),
  );
  const filesContents = await Promise.all(
    filePathsWithExtension.map(
      async (filePath) => await readTextFile(filePath),
    ),
  );
  await Promise.all(
    filePathsWithExtension.map(async (filePath, i) => {
      const fileContents = filesContents[i];
      assertDefined(
        fileContents,
        `Failed to get the file contents at index: ${i}`,
      );
      const newFileContents = fileContents.replaceAll("../../src/", "src/");
      await fs.writeFile(filePath, newFileContents);
    }),
  );
}

/** By default, TypeScript creates ".d.ts" files, but we need both ".d.cts" and ".d.mts" files. */
async function copyDeclarations(packageRoot: string) {
  const outDir = path.join(packageRoot, "dist");
  const filePaths = await getFilePathsInDirectory(outDir, "files", true);
  const declarationFilePaths = filePaths.filter((filePath) =>
    filePath.endsWith(".d.ts"),
  );

  await Promise.all(
    declarationFilePaths.map(async (filePath) => {
      await Promise.all(
        [".d.cts", ".d.mts"].map(async (newExtension) => {
          const newPath = trimSuffix(filePath, ".d.ts") + newExtension;
          await copyFileOrDirectory(filePath, newPath);
        }),
      );
    }),
  );

  // We do not need to create "index.d.cts.map" or "index.d.mts.map" files, because all of the
  // copied declaration files point to "index.d.ts.map".
}
