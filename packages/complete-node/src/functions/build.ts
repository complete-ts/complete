/**
 * Helper functions for build scripts.
 *
 * @module
 */

import path from "node:path";
import { $, $o, $q } from "./execa.js";
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
 * Handily, this will automatically bake in the `APP_NAME` and `APP_VERSION` environment variables
 * from the corresponding "package.json" file so that they can be used by the resulting program.
 *
 * @see https://bun.sh/docs/bundler/executables
 */
export async function compileToSingleFileWithBun(): Promise<void> {
  const projectRoot = await getPackageRoot(2);
  const packageJSONPath = path.join(projectRoot, "package.json");
  const packageJSON = await getPackageJSON(packageJSONPath);
  const { name, version } = packageJSON;

  if (typeof name !== "string" || name === "") {
    throw new Error(
      `Failed to find the "name" field in the following file: ${packageJSONPath}`,
    );
  }

  if (typeof version !== "string" || version === "") {
    throw new Error(
      `Failed to find the "version" field in the following file: ${packageJSONPath}`,
    );
  }

  // We invoke Bun with `execa` instead of the API to avoid this package depending on "@types/bun".
  await $`bun build --compile --target=bun-linux-x64 --minify --sourcemap ./src/main.ts --outfile ${name} --define:process.env.APP_VERSION=${version}`;
}
