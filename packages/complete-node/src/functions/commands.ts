/**
 * Helper functions for checking if commands exist.
 *
 * @module
 */

import which from "which";
import { $o } from "./execa.js";

/**
 * Helper function to check if a specific command exists on the system by attempting to resolve it
 * with the "which" library.
 */
export async function commandExists(commandName: string): Promise<boolean> {
  try {
    await which(commandName);
  } catch {
    return false;
  }

  return true;
}

/**
 * Helper function to get the locally installed Python command. In most cases, this will be
 * "python", but on Ubuntu it will be "python3" (for legacy reasons). This is necessary to know if
 * JavaScript/TypeScript is launching Python.
 *
 * Returns undefined if Python is not installed on the system.
 *
 * @param fatal Whether to exit the program if Python is not found.
 */
export async function getPythonCommand(
  fatal: true,
): Promise<"python" | "python3">;
export async function getPythonCommand(
  fatal: false,
): Promise<"python" | "python3" | undefined>;
export async function getPythonCommand(
  fatal: boolean,
): Promise<"python" | "python3" | undefined> {
  const python3Works = await doesCommandWork("python3");
  if (python3Works) {
    return "python3";
  }

  const pythonWorks = await doesCommandWork("python");
  if (pythonWorks) {
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
async function doesCommandWork(command: string): Promise<boolean> {
  try {
    const output = await $o`${command} --version`;
    return !output.includes("was not found");
  } catch {
    return false;
  }
}
