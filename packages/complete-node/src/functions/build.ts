/**
 * Helper functions for build scripts.
 *
 * @module
 */

import { assertString } from "complete-common";
import path from "node:path";
import { $, $o, $q } from "./execa.js";
import { isFile } from "./file.js";
import { getPackageJSON } from "./packageJSON.js";

/**
 * Helper function to see if the compiled output that is checked-in to the Git repository is
 * up-to-date.
 *
 * Note that compiled output (in e.g. the "dist" directory) is not usually committed to a Git
 * repository, but this is necessary in certain cases, such as when writing a custom GitHub Action
 * in TypeScript. In these situations, this function should be run as part of the linting stage in
 * order to ensure that the compiled output is always up to date.
 *
 * @throws If the compiled output is not up-to-date.
 */
export async function checkCompiledOutputInRepo(): Promise<void> {
  const command = "npm run build";
  const commandParts = command.split(" ");
  await $q`${commandParts}`;

  const gitStatusOutput = await $o`git status --porcelain`;
  const gitDirty = gitStatusOutput === "";

  if (gitDirty) {
    throw new Error(
      `The compiled output does not match the Git repository. Run: ${command}`,
    );
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
 * @param packageRoot The path to the root of the package.
 * @throws If the "package.json" file does not exist or cannot be parsed.
 * @see https://bun.com/docs/bundler/executables
 */
export async function compileToSingleFileWithBun(
  packageRoot: string,
): Promise<void> {
  const packageJSONPath = path.join(packageRoot, "package.json");
  const packageJSONExists = await isFile(packageJSONPath);
  if (!packageJSONExists) {
    throw new Error(
      `Failed to find the project "package.json" file at: ${packageJSONPath}`,
    );
  }

  const packageJSON = await getPackageJSON(packageJSONPath);
  const { name } = packageJSON;

  assertString(
    name,
    `Failed to find the "name" field in the "package.json" file located at: ${packageJSONPath}`,
  );

  if (name === "") {
    throw new Error(
      `The "name" field was empty in the "package.json" file located at: ${packageJSONPath}`,
    );
  }

  const entryPointPath = path.join(packageRoot, "src", "main.ts");
  const entryPointExists = await isFile(entryPointPath);
  if (!entryPointExists) {
    throw new Error(`Failed to find the entrypoint at: ${entryPointPath}`);
  }

  // We invoke Bun with `execa` instead of the API to avoid this package depending on "@types/bun".
  await $`bun build --compile --target=bun-linux-x64 --minify --sourcemap --outfile=${name} ${entryPointPath}`;
}
