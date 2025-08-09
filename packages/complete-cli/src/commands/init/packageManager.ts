import chalk from "chalk";
import type { ReadonlyRecord } from "complete-common";
import { assertDefined, getEnumValues } from "complete-common";
import {
  commandExists,
  getJavaScriptRuntime,
  JavaScriptRuntime,
  PackageManager,
} from "complete-node";
import { DEFAULT_PACKAGE_MANAGER } from "../../constants.js";
import { promptError } from "../../prompt.js";

const PACKAGE_MANAGERS = getEnumValues(PackageManager);

export async function getPackageManagerUsedForNewProject(
  options: ReadonlyRecord<PackageManager, boolean>,
): Promise<PackageManager> {
  // If the package manager was explicitly specified in the options, use that.
  const packageManagerFromOptions = await getPackageManagerFromOptions(options);
  if (packageManagerFromOptions !== undefined) {
    return packageManagerFromOptions;
  }

  // If `bun` or `bunx` was used to launch this program, assume that they also want to use the Bun
  // package manager.
  const javaScriptRuntime = getJavaScriptRuntime();
  assertDefined(javaScriptRuntime, "Failed to get the JavaScript runtime.");
  if (javaScriptRuntime === JavaScriptRuntime.bun) {
    return PackageManager.bun;
  }

  return DEFAULT_PACKAGE_MANAGER;
}

async function getPackageManagerFromOptions(
  options: ReadonlyRecord<PackageManager, boolean>,
) {
  for (const packageManager of PACKAGE_MANAGERS) {
    if (options[packageManager]) {
      // Only one package manager flag will be specified at a time.
      // eslint-disable-next-line no-await-in-loop
      const exists = await commandExists(packageManager);
      if (!exists) {
        promptError(
          `You specified the "--${packageManager}" option, but "${chalk.green(
            packageManager,
          )}" does not seem to be a valid command.`,
        );
      }

      return packageManager;
    }
  }

  return undefined;
}
