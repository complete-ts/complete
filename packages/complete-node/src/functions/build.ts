// Contains helper functions for build scripts.

import { assertDefined } from "complete-common";
import fs from "node:fs";
import { $q, $s } from "./execa.js";
import { getMatchingFilePaths, renameFileExtensions, rm } from "./file.js";

/**
 * Helper function to invoke `tsc` twice, producing both CommonJS (CJS) and ECMAScript modules (ESM)
 * output.
 *
 * @param outDir Optional. The full path to the directory that TypeScript puts the compiled files.
 *               Default is "dist".
 */
export async function buildCJSAndESM(outDir = "dist"): Promise<void> {
  rm(outDir);

  // `tsc` will create the following files:
  // - foo.d.ts
  // - foo.d.ts.map
  // - foo.js
  // - foo.js.map

  $s`tsc`;

  await renameFileExtensions(outDir, "d.ts", "d.mts");
  await renameFileExtensions(outDir, "d.ts.map", "d.mts.map");
  await renameFileExtensions(outDir, "js", "mjs");
  await renameFileExtensions(outDir, "js.map", "mjs.map");

  await rewriteDeclarationFiles(outDir, true);
  await rewriteDeclarationMapFiles(outDir, true);
  await rewriteSourceFiles(outDir, true);
  await rewriteSourceMapFiles(outDir, true);

  $s`tsc --module CommonJS`;

  await renameFileExtensions(outDir, "d.ts", "d.cts");
  await renameFileExtensions(outDir, "d.ts.map", "d.cts.map");
  await renameFileExtensions(outDir, "js", "cjs");
  await renameFileExtensions(outDir, "js.map", "cjs.map");

  await rewriteDeclarationFiles(outDir, false);
  await rewriteDeclarationMapFiles(outDir, false);
  await rewriteSourceFiles(outDir, false);
  await rewriteSourceMapFiles(outDir, false);
}

/**
 * After renaming `foo.d.ts` to `foo.d.mts`, the declaration map path will be messed up.
 *
 * For example:
 *
 * ```ts
 * //# sourceMappingURL=foo.d.ts.map
 * ```
 *
 * Needs to be rewritten to:
 *
 * ```ts
 * //# sourceMappingURL=foo.d.mts.map
 * ```
 */
async function rewriteDeclarationFiles(
  directoryPath: string,
  esm: boolean,
): Promise<void> {
  const extensionFinalWord = esm ? "mts" : "cts";
  const extension = `.d.${extensionFinalWord}`;
  const matchFunc = (filePath: string) => filePath.endsWith(extension);
  const filePaths = await getMatchingFilePaths(directoryPath, matchFunc);

  const readPromises: Array<Promise<string>> = [];

  for (const filePath of filePaths) {
    const readPromise = fs.promises.readFile(filePath, "utf8");
    readPromises.push(readPromise);
  }

  const filesContents = await Promise.all(readPromises);

  const writePromises: Array<Promise<void>> = [];

  for (const [i, fileContents] of filesContents.entries()) {
    const filePath = filePaths[i];
    assertDefined(
      filePath,
      `Failed to get the file path corresponding to index: ${i}`,
    );

    const newFileContents = fileContents.replace(
      /\/\/# sourceMappingURL=(.+?)\.d\.ts.map/,
      `//# sourceMappingURL=$1.d.${extensionFinalWord}.map`,
    );
    const writePromise = fs.promises.writeFile(filePath, newFileContents);
    writePromises.push(writePromise);
  }

  await Promise.all(writePromises);
}

/**
 * After renaming `foo.d.ts.map` to `foo.d.mts.map`, the backwards reference path will be messed up.
 *
 * For example:
 *
 * ```json
 * {"version":3,"file":"foo.d.ts",
 * ```
 *
 * Needs to be rewritten to:
 *
 * ```json
 * {"version":3,"file":"foo.d.mts",
 * ```
 */
async function rewriteDeclarationMapFiles(
  directoryPath: string,
  esm: boolean,
): Promise<void> {
  const extensionFinalWord = esm ? "mts" : "cts";
  const extension = `.d.${extensionFinalWord}.map`;
  const matchFunc = (filePath: string) => filePath.endsWith(extension);
  const filePaths = await getMatchingFilePaths(directoryPath, matchFunc);

  const readPromises: Array<Promise<string>> = [];

  for (const filePath of filePaths) {
    const readPromise = fs.promises.readFile(filePath, "utf8");
    readPromises.push(readPromise);
  }

  const filesContents = await Promise.all(readPromises);

  const writePromises: Array<Promise<void>> = [];

  for (const [i, fileContents] of filesContents.entries()) {
    const filePath = filePaths[i];
    assertDefined(
      filePath,
      `Failed to get the file path corresponding to index: ${i}`,
    );

    const newFileContents = fileContents.replace(
      /"file":"(.+?)\.d\.ts",/,
      `"file":"$1.d.${extensionFinalWord}",`,
    );
    const writePromise = fs.promises.writeFile(filePath, newFileContents);
    writePromises.push(writePromise);
  }

  await Promise.all(writePromises);
}

/**
 * After renaming `foo.js` to `foo.mjs`, the source map path will be messed up.
 *
 * For example:
 *
 * ```ts
 * //# sourceMappingURL=foo.js.map
 * ```
 *
 * Needs to be rewritten to:
 *
 * ```ts
 * //# sourceMappingURL=foo.mjs.map
 * ```
 */
async function rewriteSourceFiles(
  directoryPath: string,
  esm: boolean,
): Promise<void> {
  const extensionFinalWord = esm ? "mjs" : "cjs";
  const extension = `.${extensionFinalWord}`;
  const matchFunc = (filePath: string) => filePath.endsWith(extension);
  const filePaths = await getMatchingFilePaths(directoryPath, matchFunc);

  const readPromises: Array<Promise<string>> = [];

  for (const filePath of filePaths) {
    const readPromise = fs.promises.readFile(filePath, "utf8");
    readPromises.push(readPromise);
  }

  const filesContents = await Promise.all(readPromises);

  const writePromises: Array<Promise<void>> = [];

  for (const [i, fileContents] of filesContents.entries()) {
    const filePath = filePaths[i];
    assertDefined(
      filePath,
      `Failed to get the file path corresponding to index: ${i}`,
    );

    const newFileContents = fileContents.replace(
      /\/\/# sourceMappingURL=(.+?)\.js.map/,
      `//# sourceMappingURL=$1.${extensionFinalWord}.map`,
    );
    const writePromise = fs.promises.writeFile(filePath, newFileContents);
    writePromises.push(writePromise);
  }

  await Promise.all(writePromises);
}

/**
 * After renaming `foo.js.map` to `foo.mjs.map`, the backwards reference path will be messed up.
 *
 * For example:
 *
 * ```json
 * {"version":3,"file":"foo.js",
 * ```
 *
 * Needs to be rewritten to:
 *
 * ```json
 * {"version":3,"file":"foo.mjs",
 * ```
 */
async function rewriteSourceMapFiles(
  directoryPath: string,
  esm: boolean,
): Promise<void> {
  const extensionFinalWord = esm ? "mjs" : "cjs";
  const extension = `.${extensionFinalWord}.map`;
  const matchFunc = (filePath: string) => filePath.endsWith(extension);
  const filePaths = await getMatchingFilePaths(directoryPath, matchFunc);

  const readPromises: Array<Promise<string>> = [];

  for (const filePath of filePaths) {
    const readPromise = fs.promises.readFile(filePath, "utf8");
    readPromises.push(readPromise);
  }

  const filesContents = await Promise.all(readPromises);

  const writePromises: Array<Promise<void>> = [];

  for (const [i, fileContents] of filesContents.entries()) {
    const filePath = filePaths[i];
    assertDefined(
      filePath,
      `Failed to get the file path corresponding to index: ${i}`,
    );

    const newFileContents = fileContents.replace(
      /"file":"(.+?)\.js",/,
      `"file":"$1.${extensionFinalWord}",`,
    );
    const writePromise = fs.promises.writeFile(filePath, newFileContents);
    writePromises.push(writePromise);
  }

  await Promise.all(writePromises);
}

/**
 * Helper function to see if the compiled output that is checked-in to the Git repository is
 * up-to-date.
 *
 * Note that compiled output (in e.g. the "dist" directory) is not usually committed to a Git
 * repository, but this is necessary in certain cases, such as when writing a custom GitHub Action
 * in TypeScript. In these situations, this function should be run as part of the linting stage in
 * order to ensure that the compiled output is always up to date.
 */
export async function checkCompiledOutputInRepo(): Promise<void> {
  await $q`npm run build`;

  const gitStatusResult = await $q`git status --porcelain`;
  const gitStatus = gitStatusResult.stdout;
  const gitDirty = gitStatus === "";

  if (gitDirty) {
    process.exit(1);
  }
}
