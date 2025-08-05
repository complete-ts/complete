/**
 * Helper functions relating to JavaScript/TypeScript projects.
 *
 * @module
 */

import { assertDefined } from "complete-common";
import path from "node:path";
import { packageDirectory } from "package-directory";
import { getCallingFunction } from "./stack.js";

/**
 * Helper function to get the directory of the closest "package.json" file, starting from the file
 * that contains the calling function.
 *
 * @param upStackBy Optional. The number of functions to rewind in the calling stack before
 *                  attempting to find the closest "package.json" file. Default is 1.
 * @param verbose Optional. Shows all of the stack frames. Default is false.
 * @throws If the calling function cannot be determined or if a "package.json" file cannot be found.
 */
export async function getPackageRoot(
  upStackBy = 1,
  verbose = false,
): Promise<string> {
  const { filePath } = getCallingFunction(upStackBy, verbose);

  const cwd = path.dirname(filePath);
  const projectRoot = await packageDirectory({ cwd });
  assertDefined(
    projectRoot,
    `Failed to get the closest "package.json" file starting from: ${cwd}`,
  );

  return projectRoot;
}
