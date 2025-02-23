import chalk from "chalk";
import { commandExists, PackageManager } from "complete-node";
import { DEFAULT_PACKAGE_MANAGER } from "../../constants.js";
import { promptError } from "../../prompt.js";

interface PackageManagerOptions {
  npm: boolean;
  yarn: boolean;
  pnpm: boolean;
}

export async function getPackageManagerUsedForNewProject(
  options: PackageManagerOptions,
): Promise<PackageManager> {
  const packageManagerFromOptions = await getPackageManagerFromOptions(options);
  if (packageManagerFromOptions !== undefined) {
    return packageManagerFromOptions;
  }

  return DEFAULT_PACKAGE_MANAGER;
}

async function getPackageManagerFromOptions(options: PackageManagerOptions) {
  if (options.npm) {
    const npmExists = await commandExists("npm");
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
    const yarnExists = await commandExists("yarn");
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
    const pnpmExists = await commandExists("pnpm");
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
