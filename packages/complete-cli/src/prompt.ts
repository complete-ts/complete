// Both the Inquirer.js library and the Prompts library have a bug where text is duplicated in a Git
// Bash terminal. Thus, we revert to using the simpler Prompt library.

import {
  cancel,
  confirm,
  intro,
  isCancel,
  log,
  outro,
  spinner,
  text,
} from "@zamiell/clack-prompts";
import chalk from "chalk";
import { PROJECT_NAME } from "./constants.js";

export function promptStart(): void {
  intro(chalk.inverse(PROJECT_NAME));
}

export function promptEnd(msg: string): never {
  outro(msg);
  process.exit();
}

export async function getInputYesNo(
  msg: string,
  defaultValue = true,
): Promise<boolean> {
  const input = await confirm({
    message: msg,
    initialValue: defaultValue,
  });

  if (isCancel(input)) {
    cancel("Canceled.");
    process.exit(1);
  }

  return input;
}

/** Returns trimmed input. */
export async function getInputString(
  msg: string,
  defaultValue?: string,
): Promise<string> {
  const input = await text({
    message: msg,
    initialValue: defaultValue,
  });

  if (isCancel(input)) {
    cancel("Canceled.");
    process.exit(1);
  }

  // The "text" return type is bugged: "input" is equal to "undefined" if the user did not enter any
  // input.
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  if (input === undefined || input.trim() === "") {
    promptError("You must enter a non-empty value.");
  }

  return input.trim();
}

export function promptLog(msg: string): void {
  log.step(msg); // Step is a hollow green diamond.
}

export function promptSpinnerStart(msg: string): ReturnType<typeof spinner> {
  const s = spinner({
    indicator: "timer",
  });
  s.start(msg);
  return s;
}

export function promptError(msg: string): never {
  cancel(msg);
  process.exit(1);
}
