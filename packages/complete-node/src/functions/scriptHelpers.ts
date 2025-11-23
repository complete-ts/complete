/**
 * Helper functions for creating TypeScript project scripts.
 *
 * @module
 */

/* eslint-disable sort-exports/sort-exports */

import {
  assertDefined,
  getElapsedSeconds,
  includesAny,
  isObject,
} from "complete-common";
import { ExecaError, ExecaSyncError } from "execa";
import { Listr } from "listr2";
import path from "node:path";
import { packageDirectory } from "package-directory";
import { $q } from "./execa.js";
import { deleteFileOrDirectory } from "./file.js";
import { getArgs } from "./utils.js";

/** This should match what is listed in the "complete-lint/website-root.md" file. */
const DEFAULT_LINT_COMMANDS = [
  // Use TypeScript to type-check the code.
  "tsc --noEmit",
  "tsc --noEmit --project ./scripts/tsconfig.json",

  // Use ESLint to lint the TypeScript code.
  "eslint .",

  // Use Prettier to check formatting.
  // - "--log-level=warn" makes it only output errors.
  "prettier --log-level=warn --check .",

  // Use Knip to check for unused files, exports, and dependencies.
  // - "--treat-config-hints-as-errors" - Exit with non-zero code (1) if there are any configuration
  //   hints.
  "knip --treat-config-hints-as-errors",

  // Use CSpell to spell check every file.
  // - "--no-progress" and "--no-summary" make it only output errors.
  "cspell --no-progress --no-summary",

  // Check for unused words in the CSpell configuration file.
  "cspell-check-unused-words",

  // Check for template updates.
  "complete-cli check",
] as const;

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
export async function buildScript(
  importMetaDirname: string,
  func: ScriptCallback,
): Promise<void> {
  const buildFunc: ScriptCallback = async (packageRoot) => {
    await deleteFileOrDirectory("dist");
    await func(packageRoot);
  };

  await script(importMetaDirname, buildFunc, "built");
}

/** See the documentation for the `script` helper function. */
export async function lintScript(
  importMetaDirname: string,
  func: ScriptCallback,
): Promise<void> {
  await script(importMetaDirname, func, "linted");
}

/** See the documentation for the `script` helper function. */
export async function testScript(
  importMetaDirname: string,
  func: ScriptCallback,
): Promise<void> {
  await script(importMetaDirname, func, "tested");
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
 * @param importMetaDirname The value of `import.meta.dirname` (so that this function can find the
 *                          package root).
 * @param func The function that contains the build logic for the particular script. This is passed
 *             the path to the package root. (See the `ScriptCallbackData` interface.)
 * @param verb Optional. The verb for when the script completes. For example, "built".
 * @throws If the provided function fails.
 */
export async function script(
  importMetaDirname: string,
  func: ScriptCallback,
  verb?: string,
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
  const verbose = includesAny(args, "verbose", "--verbose", "-v");

  const packageRoot = await packageDirectory({ cwd: importMetaDirname });
  assertDefined(
    packageRoot,
    `Failed to find the package root from the directory of: ${packageRoot}`,
  );

  process.chdir(packageRoot);
  if (verbose) {
    console.log(
      `Changed the working directory to the package root at: ${packageRoot}`,
    );
  }

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
 * Helper function to run a series of concurrent lint commands. Nice console output will be shown
 * with the "listr2" library.
 *
 * @param importMetaDirname The value of `import.meta.dirname` (so that this function can find the
 *                          package root).
 * @param commands Optional. The commands or functions to run. Defaults to the standard tools that
 *                 are listed in the documentation for `complete-lint`:
 * https://complete-ts.github.io/complete-lint#step-5---create-a-lint-script
 * @param quiet Optional. If true, will not print the time taken. Defaults to false.
 */
export async function lintCommands(
  importMetaDirname: string,
  commands: ReadonlyArray<
    string | [name: string, promise: Promise<unknown>]
  > = DEFAULT_LINT_COMMANDS,
  quiet = false,
): Promise<void> {
  const startTime = Date.now();

  const packageRoot = await packageDirectory({ cwd: importMetaDirname });
  assertDefined(
    packageRoot,
    `Failed to find the package root from the directory of: ${packageRoot}`,
  );

  const tasks = commands.map((command) => {
    // Handle normal commands.
    if (typeof command === "string") {
      return {
        title: command,
        task: async () => {
          const [cmd, ...args] = command.split(" ");
          if (cmd === undefined) {
            throw new Error(`Invalid command: ${command}`);
          }

          return await $q(cmd, args, {
            cwd: packageRoot,
          });
        },
      };
    }

    // Handle promises.
    return {
      title: command[0],
      task: async () => await command[1],
    };
  });

  const listr = new Listr<unknown>(tasks, {
    concurrent: true,
    exitOnError: false,
    collectErrors: "minimal",
  });

  await listr.run();

  if (listr.errors.length > 0) {
    process.exit(1);
  }

  if (!quiet) {
    console.log();
    const packageName = path.basename(packageRoot);
    printSuccess(startTime, "linted", packageName);
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
