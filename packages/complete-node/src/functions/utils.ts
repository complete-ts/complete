/**
 * Helper functions that do not belong to any category in particular.
 *
 * @module
 */

import chalk from "chalk";
import { assertDefined } from "complete-common";
import { diffLines } from "diff";
import { fileURLToPath } from "node:url";
import { get as getStackFrames } from "stack-trace";

/**
 * Helper function to print the differences between two strings. Similar to the `diff` Unix program.
 */
export function diff(string1: string, string2: string): void {
  const differences = diffLines(string1, string2);
  for (const difference of differences) {
    if (difference.added) {
      console.log(`${chalk.green("+")} ${difference.value.trim()}`);
    } else if (difference.removed) {
      console.log(`${chalk.red("-")} ${difference.value.trim()}`);
    }
  }
}

/**
 * Helper function to print out an error message and then exit the program.
 *
 * All of the arguments will be passed to the `console.error` function.
 */
export function fatalError(...args: readonly unknown[]): never {
  console.error(...args);
  process.exit(1);
}

/**
 * Helper function to get the command-line arguments passed to the program/script.
 *
 * This is an alias for: `process.argv.slice(2)`
 */
export function getArgs(): readonly string[] {
  return process.argv.slice(2);
}

/**
 * Helper function to see if the current file is is the JavaScript/TypeScript entry point. Returns
 * false if the current file was imported from somewhere else.
 *
 * This is similar to the `__name__ == "__main__"` pattern from the Python programming language.
 */
export function isMain(): boolean {
  const stackFrames = getStackFrames();

  /**
   * - The 1st stack frame is from this function.
   * - The 2nd stack frame is from the calling function.
   */
  const stackFrame = stackFrames[1];
  assertDefined(
    stackFrame,
    "Failed to get the stack frame of the calling function.",
  );

  const callingFileURL = stackFrame.getFileName();
  const callingFiledPath = fileURLToPath(callingFileURL);

  return process.argv[1] === callingFiledPath;
}
