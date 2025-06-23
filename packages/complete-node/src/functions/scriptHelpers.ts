/**
 * Helper functions for creating TypeScript project scripts.
 *
 * @module
 */

/* eslint-disable sort-exports/sort-exports */

import { getElapsedSeconds, includesAny, isObject } from "complete-common";
import { ExecaError, ExecaSyncError } from "execa";
import path from "node:path";
import { $ } from "./execa.js";
import { rm } from "./file.js";
import { getPackageRoot } from "./project.js";
import { getArgs } from "./utils.js";

/**
 * The type of the function passed to the `script` helper function. (And the related helper
 * functions.)
 */
export type ScriptCallback = (
  /** The full path to the directory where the closest "package.json" is located. */
  packageRoot: string,
) => Promise<void> | void;

/**
 * Removes the "dist" directory (if it exists), then runs the provided logic.
 *
 * For more information, see the documentation for the `script` helper function.
 */
export async function buildScript(func: ScriptCallback): Promise<void> {
  const buildFunc: ScriptCallback = async (packageRoot) => {
    rm("dist");
    await func(packageRoot);
  };

  await script(buildFunc, "built", 2);
}

/** See the documentation for the `script` helper function. */
export async function lintScript(func: ScriptCallback): Promise<void> {
  await script(func, "linted", 2);
}

/**
 * Use this function with the `lintScript` helper function if you want to just use the standard
 * linting checks for a TypeScript project without any project-specific customization.
 *
 * For example:
 *
 * ```ts
 * import { lintScript, standardLintFunction } from "complete-node";
 *
 * await lintScript(standardLintFunction);
 * ```
 *
 * See [the official docs](/complete-lint#step-5---create-a-lint-script) for what specific checks
 * are performed.
 */
// This function must match the documentation in "complete-lint".
export async function standardLintFunction(): Promise<void> {
  await Promise.all([
    // Use TypeScript to type-check the code.
    $`tsc --noEmit`,
    $`tsc --noEmit --project ./scripts/tsconfig.json`,

    // Use ESLint to lint the TypeScript code.
    // - "--max-warnings 0" makes warnings fail, since we set all ESLint errors to warnings.
    $`eslint --max-warnings 0 .`,

    // Use Prettier to check formatting.
    // - "--log-level=warn" makes it only output errors.
    $`prettier --log-level=warn --check .`,

    // Use Knip to check for unused files, exports, and dependencies.
    $`knip --no-progress`,

    // Use CSpell to spell check every file.
    // - "--no-progress" and "--no-summary" make it only output errors.
    $`cspell --no-progress --no-summary .`,

    // Check for unused words in the CSpell configuration file.
    $`cspell-check-unused-words`,

    // Check for template updates.
    $`complete-cli check`,
  ]);
}

/** See the documentation for the `script` helper function. */
export async function testScript(func: ScriptCallback): Promise<void> {
  await script(func, "tested", 2);
}

/**
 * Helper function to create a script for a TypeScript project. You can pass any arbitrary logic you
 * want.
 *
 * This is intended to be used with the `$` function from either `execa` or `Bun` so that you can
 * make a TypeScript script in the style of a Bash script.
 *
 * (This function will work in both the Node.js and Bun runtimes.)
 *
 * Specifically, this helper function will:
 *
 * 1. Change the working directory to where the nearest "package.json" file is.
 * 2. Run the provided function.
 * 3. Print a success message with the total amount of seconds taken (if a verb was provided and
 *    there is not a quiet/silent flag).
 *
 * @param func The function that contains the build logic for the particular script. This is passed
 *             the path to the package root. (See the `ScriptCallbackData` interface.)
 * @param verb Optional. The verb for when the script completes. For example, "built".
 * @param upStackBy Optional. The number of functions to rewind in the calling stack before
 *                  attempting to find the closest "package.json" file. Default is 1.
 */
export async function script(
  func: ScriptCallback,
  verb?: string,
  upStackBy = 1,
): Promise<void> {
  const args = getArgs();
  const quiet = includesAny(
    args,
    "quiet",
    "--quiet",
    "-q",
    "silent",
    "--silent",
    "-s",
  );

  const packageRoot = await getPackageRoot(upStackBy + 1);

  process.chdir(packageRoot);

  const startTime = Date.now();

  // We use a try-catch block to remove the JavaScript stack trace for the purposes of emulating a
  // Bash script. (But we only want to remove it for shell commands.)
  try {
    await func(packageRoot);
  } catch (error) {
    if (
      error instanceof ExecaError
      || error instanceof ExecaSyncError
      || (isObject(error) && error.constructor.name === "ShellError")
    ) {
      console.error(
        `The following command exited with a code of ${error.exitCode}: ${error.command}`,
      );
      const exitCode = typeof error.exitCode === "number" ? error.exitCode : 1;
      process.exit(exitCode);
    } else {
      throw error;
    }
  }

  if (!quiet && verb !== undefined) {
    const packageName = path.basename(packageRoot);
    printSuccess(startTime, verb, packageName);
  }
}

/**
 * Helper function to print a success message with the number of elapsed seconds.
 *
 * @param startTime The start time in milliseconds (as recorded by the `Date.now` method).
 * @param verb The verb to print. For example, "built".
 * @param noun The noun to print. For example, "foo".
 */
export function printSuccess(
  startTime: number,
  verb: string,
  noun: string,
): void {
  const elapsedSeconds = getElapsedSeconds(startTime);
  const secondsText = elapsedSeconds === 1 ? "second" : "seconds";
  console.log(
    `Successfully ${verb} ${noun} in ${elapsedSeconds} ${secondsText}.`,
  );
}

/**
 * Alias for "console.log".
 *
 * @allowEmptyVariadic
 */
export function echo(...args: readonly unknown[]): void {
  console.log(...args);
}

/** Alias for "process.exit". */
export function exit(code = 0): never {
  return process.exit(code);
}

/**
 * Helper function to sleep for a certain number of seconds.
 *
 * Under the hood, this uses promises with `setTimeout`.
 */
export async function sleep(seconds: number): Promise<unknown> {
  // eslint-disable-next-line no-promise-executor-return
  return await new Promise((resolve) => setTimeout(resolve, seconds * 1000));
}
