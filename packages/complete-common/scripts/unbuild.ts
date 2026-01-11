import { mapAsync, trimSuffix } from "complete-common";
import {
  $,
  copyFileOrDirectory,
  deleteFileOrDirectory,
  fixMonorepoPackageDistDirectory,
  getFilePathsInDirectory,
  isFile,
  moveFileOrDirectory,
  replaceTextInFile,
} from "complete-node";
import os from "node:os";
import path from "node:path";

const TYPESCRIPT_FILE_EXTENSIONS = ["ts", "mts", "cts"] as const;

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

  await mapAsync(TYPESCRIPT_FILE_EXTENSIONS, async (extension) => {
    const filePath = path.join("dist", `index.d.${extension}`);
    await replaceTextInFile(filePath, searchValue, replaceValue);
  });
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
  await mapAsync(javaScriptFileNames, async (fileName) => {
    const srcPath = path.join(outDir, fileName);
    const dstPath = path.join(tmpDir, fileName);
    await moveFileOrDirectory(srcPath, dstPath);
  });

  await deleteFileOrDirectory(outDir);
  await $`tsc --emitDeclarationOnly`;
  const indexFilePath = path.join(outDir, "index.d.ts");
  const indexFileExists = await isFile(indexFilePath);
  if (!indexFileExists) {
    await fixMonorepoPackageDistDirectory(packageRoot);
  }

  // Move the JavaScript files back.
  await mapAsync(javaScriptFileNames, async (fileName) => {
    const srcPath = path.join(tmpDir, fileName);
    const dstPath = path.join(outDir, fileName);
    await moveFileOrDirectory(srcPath, dstPath);
  });
}

/** By default, TypeScript creates ".d.ts" files, but we need both ".d.cts" and ".d.mts" files. */
async function copyDeclarations(packageRoot: string) {
  const outDir = path.join(packageRoot, "dist");
  const filePaths = await getFilePathsInDirectory(outDir, "files", true);
  const declarationFilePaths = filePaths.filter((filePath) =>
    filePath.endsWith(".d.ts"),
  );

  await mapAsync(declarationFilePaths, async (filePath) => {
    const extensions = [".d.cts", ".d.mts"];
    await mapAsync(extensions, async (newExtension) => {
      const newPath = trimSuffix(filePath, ".d.ts") + newExtension;
      await copyFileOrDirectory(filePath, newPath);
    });
  });

  // We do not need to create "index.d.cts.map" or "index.d.mts.map" files, because all of the
  // copied declaration files point to "index.d.ts.map".
}
