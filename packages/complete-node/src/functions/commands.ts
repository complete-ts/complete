/**
 * Helper functions for checking if commands exist.
 *
 * @module
 */

import commandExists from "command-exists";
import { execSync } from "node:child_process";

/**
 * Helper function to get the locally installed Python command. In most cases, this will be
 * "python", but on Ubuntu it will be "python3" (for legacy reasons). This is necessary to know if
 * JavaScript/TypeScript is launching Python.
 *
 * Returns undefined if Python is not installed on the system.
 *
 * @param fatal Whether to exit the program if Python is not found.
 */
export function getPythonCommand(fatal: true): "python" | "python3";
export function getPythonCommand(
  fatal: false,
): "python" | "python3" | undefined;
export function getPythonCommand(
  fatal: boolean,
): "python" | "python3" | undefined {
  if (commandExists.sync("python3") && doesCommandWork("python3")) {
    return "python3";
  }

  if (commandExists.sync("python") && doesCommandWork("python")) {
    return "python";
  }

  if (fatal) {
    throw new Error(
      "You must have Python installed and available in the PATH to run this program.",
    );
  }

  return undefined;
}

/**
 * By default, "python" will exist on Windows, but it is not actually a real version of Python.
 * Running it will generating the following output:
 *
 * ```text
 * Python was not found; run without arguments to install from the Microsoft Store, or disable
 * this shortcut from Settings > Manage App Execution Aliases.
 * ```
 */
function doesCommandWork(command: string): boolean {
  try {
    const output = execSync(`${command} --version`, { encoding: "utf8" });
    return !output.includes("was not found");
  } catch {
    return false;
  }
}
