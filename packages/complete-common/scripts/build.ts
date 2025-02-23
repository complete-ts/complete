import { trimSuffix } from "complete-common";
import {
  $,
  buildScript,
  copyFileOrDirectory,
  copyFileOrDirectoryAsync,
  deleteFileOrDirectory,
  getMatchingFilePaths,
  replaceTextInFile,
} from "complete-node";
import os from "node:os";
import path from "node:path";

const OUTPUT_FILES = ["index.cjs", "index.mjs"] as const;

await buildScript(async (packageRoot) => {
  await $`unbuild`; // We use the `unbuild` library to output both ESM and CJS.
  fixBuggedReadonlyConstructors();
  buildDeclarations(packageRoot);
  await copyDeclarations(packageRoot);
});

/**
 * For some reason `unbuild` (and `tsup`) will append a "$1" to the `ReadonlyMap` and `ReadonlySet`
 * constructors. Thus, we must manually fix this.
 */
function fixBuggedReadonlyConstructors() {
  removeBuggedTypeSuffix("Map");
  removeBuggedTypeSuffix("Set");
}

function removeBuggedTypeSuffix(typeName: string) {
  const searchValue = `Readonly${typeName}$1`;
  const replaceValue = `Readonly${typeName}`;

  for (const extension of ["ts", "mts", "cts"]) {
    const filePath1 = path.join("dist", `index.d.${extension}`);
    replaceTextInFile(filePath1, searchValue, replaceValue);
  }
}

/**
 * `unbuild` does not generate declaration maps, so we must use `tsc` to generate that. However,
 * first we move the unbuild output to a temporary directory so that it does not get overwritten.
 * (It is not possible to configure `unbuild` to disable declarations, since reading the
 * configuration file is bugged.)
 */
function buildDeclarations(packageRoot: string) {
  const outDir = path.join(packageRoot, "dist");
  const tmpDir = os.tmpdir();

  for (const fileName of OUTPUT_FILES) {
    const srcPath = path.join(outDir, fileName);
    const dstPath = path.join(tmpDir, fileName);
    copyFileOrDirectory(srcPath, dstPath);
    deleteFileOrDirectory(srcPath);
  }

  deleteFileOrDirectory(outDir);
  $.sync`tsc --emitDeclarationOnly`;

  for (const fileName of OUTPUT_FILES) {
    const srcPath = path.join(tmpDir, fileName);
    const dstPath = path.join(outDir, fileName);
    copyFileOrDirectory(srcPath, dstPath);
    deleteFileOrDirectory(srcPath);
  }
}

/** By default, TypeScript creates ".d.ts" files, but we need both ".d.cts" and ".d.mts" files. */
async function copyDeclarations(packageRoot: string) {
  const outDir = path.join(packageRoot, "dist");
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

  // We do not need to create "index.d.cts.map" or "index.d.mts.map" files, because all of the
  // copied declaration files point to "index.d.ts.map".
}
