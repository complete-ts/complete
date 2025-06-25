/**
 * Helper functions for build scripts.
 *
 * @module
 */

import path from "node:path";
import { $, $o, $q } from "./execa.js";
import { isFileAsync } from "./file.js";
import { getPackageJSON } from "./packageJSON.js";
import { getPackageRoot } from "./project.js";

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

  const gitStatusOutput = await $o`git status --porcelain`;
  const gitDirty = gitStatusOutput === "";

  if (gitDirty) {
    process.exit(1);
  }
}

/**
 * Helper function to compile a TypeScript project to a single file using Bun.
 *
 * This function invokes `bun build` with the following flags:
 *
 * - `--compile`
 * - `--target=bun-linux-x64`
 * - `--minify`
 * - `--sourcemap`
 * - `--outfile=[name]`
 *
 * This function assumes that the entrypoint is located at "./src/main.ts".
 *
 * @see https://bun.sh/docs/bundler/executables
 */
export async function compileToSingleFileWithBun(): Promise<void> {
  const projectRoot = await getPackageRoot(2);
  const packageJSONPath = path.join(projectRoot, "package.json");
  const packageJSON = await getPackageJSON(packageJSONPath);
  const { name } = packageJSON;

  if (typeof name !== "string" || name === "") {
    throw new Error(
      `Failed to find the "name" field in the "package.json" file located at: ${packageJSONPath}`,
    );
  }

  const entryPointPath = path.join(projectRoot, "src", "main.ts");
  const entryPointExists = await isFileAsync(entryPointPath);
  if (!entryPointExists) {
    throw new Error(`Failed to find the entrypoint at: ${entryPointPath}`);
  }

  // We invoke Bun with `execa` instead of the API to avoid this package depending on "@types/bun".
  await $`bun build --compile --target=bun-linux-x64 --minify --sourcemap --outfile=${name} ${entryPointPath}`;
}
