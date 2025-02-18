import chalk from "chalk";
import { PackageManager, commandExists } from "complete-node";
import { DEFAULT_PACKAGE_MANAGER } from "../../constants.js";
import { promptError } from "../../prompt.js";

interface PackageManagerOptions {
  npm: boolean;
  yarn: boolean;
  pnpm: boolean;
}

export function getPackageManagerUsedForNewProject(
  options: PackageManagerOptions,
): PackageManager {
  const packageManagerFromOptions = getPackageManagerFromOptions(options);
  if (packageManagerFromOptions !== undefined) {
    return packageManagerFromOptions;
  }

  return DEFAULT_PACKAGE_MANAGER;
}

function getPackageManagerFromOptions(options: PackageManagerOptions) {
  if (options.npm) {
    const npmExists = commandExists("npm");
    if (!npmExists) {
      promptError(
        `You specified the "--npm" option, but "${chalk.green(
          "npm",
        )}" does not seem to be a valid command.`,
      );
    }

    return PackageManager.npm;
  }

  if (options.yarn) {
    const yarnExists = commandExists("yarn");
    if (!yarnExists) {
      promptError(
        `You specified the "--yarn" option, but "${chalk.green(
          "yarn",
        )}" does not seem to be a valid command.`,
      );
    }

    return PackageManager.yarn;
  }

  if (options.pnpm) {
    const pnpmExists = commandExists("pnpm");
    if (!pnpmExists) {
      promptError(
        `You specified the "--pnpm" option, but "${chalk.green(
          "pnpm",
        )}" does not seem to be a valid command.`,
      );
    }

    return PackageManager.pnpm;
  }

  return undefined;
}
