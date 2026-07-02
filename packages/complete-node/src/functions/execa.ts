/**
 * These are functions having to do with running commands in a Bash-like TypeScript script. They are
 * based upon the `$` function from "execa".
 *
 * @module
 */

import type { TemplateExpression } from "execa";
import { $ as dollarSignFunc } from "execa";

/**
 * Run a command using the "execa" library.
 *
 * This is a wrapper around the `$` function from `execa` that sets stdout and stderr to "inherit",
 * resulting in it being passed through to the console. (By default, the "$" function only inherits
 * the stdin.) This emulates the default behavior of a Bash script.
 *
 * @allowEmptyVariadic
 * @see https://github.com/sindresorhus/execa/blob/main/docs/scripts.md
 * @see https://nodejs.org/api/child_process.html#child_process_options_stdio
 */
export const $ = dollarSignFunc({
  stdout: "inherit",
  stderr: "inherit",
});

/**
 * Run a command using the "execa" library and return its stdout as a string. The stdin will not be
 * returned.
 *
 * This is a wrapper around the `$` function from `execa`.
 */
export async function $o(
  templates: TemplateStringsArray,
  ...expressions: readonly TemplateExpression[]
): Promise<string> {
  const result = await dollarSignFunc(templates, ...expressions);
  return result.stdout;
}

/**
 * Run a command using the "execa" library. The "q" is short for "quiet", meaning that the stdout
 * will not be passed to the console.
 *
 * This is a wrapper around the `$` function from `execa`. (The quiet behavior is how the vanilla
 * version of the `$` function works, so this is just a wrapper with no additional modifications.)
 */
// If we re-export the function, then it will no longer have our JSDoc comment above.
// eslint-disable-next-line unicorn/prefer-export-from
export const $q = dollarSignFunc;
