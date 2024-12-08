/**
 * Helper functions having to do with running commands in a Bash-like TypeScript script.
 *
 * These functions are based upon the
 * [`$`](https://github.com/sindresorhus/execa/blob/main/docs/scripts.md) function from the
 * [`execa`](https://github.com/sindresorhus/execa) library, but pass the stdout/stderr to the
 * console (which is the default behavior of a Bash script).
 *
 * @module
 */

import type { Result, TemplateExpression } from "execa";
import { $ } from "execa";

// We re-export the "$" function from "execa" so that downstream projects do not have to directly
// depend on it.
export { $ } from "execa";

/**
 * Helper function to run a command and grab the output. ("o" is short for "output".)
 *
 * If an error occurs, the full JavaScript stack trace will be printed. Alternatively, if you expect
 * this command to return a non-zero exit code, you can enclose this function in a try/catch block.
 *
 * This is a wrapper around the `$.sync` function from `execa`. (The `$.sync` function automatically
 * trims the `stdout`.)
 */
export function $o(
  templates: TemplateStringsArray,
  ...expressions: readonly TemplateExpression[]
): string {
  return $.sync(templates, ...expressions).stdout;
}

/**
 * A wrapper around the `$` function from `execa`. ("q" is short for "quiet".) This is the same
 * thing as the `$` helper function, except the stdout/stderr is not passed through to the console.
 *
 * If an error occurs, the full JavaScript stack trace will be printed. Alternatively, if you expect
 * this command to return a non-zero exit code, you can enclose this function in a try/catch block.
 */
export async function $q(
  templates: TemplateStringsArray,
  ...expressions: readonly TemplateExpression[]
): Promise<Result> {
  const $$ = $({
    stdin: "pipe",
  });
  return await $$(templates, ...expressions);
}

/** Alias for the `$.sync` function from `execa`. */
export function $s(
  templates: TemplateStringsArray,
  ...expressions: readonly TemplateExpression[]
): Result {
  return $.sync(templates, ...expressions);
}

/**
 * A wrapper around the `$.sync` function from `execa`. ("sq" is short for "sync quiet".) This is
 * the same thing as the `$s` helper function, except the stdout/stderr is not passed through to the
 * console.
 *
 * If an error occurs, the full JavaScript stack trace will be printed. Alternatively, if you expect
 * this command to return a non-zero exit code, you can enclose this function in a try/catch block.
 */
export function $sq(
  templates: TemplateStringsArray,
  ...expressions: readonly TemplateExpression[]
): Result {
  const $$ = $({
    stdin: "pipe",
  });
  return $$.sync(templates, ...expressions);
}
