/**
 * Helper functions for build scripts.
 *
 * @module
 */

import { $o, $q } from "./execa.js";

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
