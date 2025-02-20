import { $ } from "execa";
import path from "node:path";
import { isFile, rm } from "./file.js";
import {
  getPackageManagerForProject,
  getPackageManagerInstallCommand,
  getPackageManagerLockFileName,
} from "./packageManager.js";
import { fatalError } from "./utils.js";

/**
 * Helper function to:
 *
 * - delete the "node_modules" directory
 * - delete any package manager lock files that exist
 * - reinstall the dependencies using the detected package manager
 *
 * This will attempt to validate that the directory is correct by looking for a "package.json" file.
 * If not found, this function will print an error message and exit.
 *
 * @param packageRoot The path to the directory that contains the "package.json" file and the
 *                    "node_modules" directory. If undefined is passed, the current working
 *                    directory will be used.
 * @returns Whether any dependencies were updated.
 */
export function nukeDependencies(packageRoot?: string): void {
  if (packageRoot === undefined) {
    packageRoot = process.cwd(); // eslint-disable-line no-param-reassign
  }

  const packageJSONPath = path.join(packageRoot, "package.json");
  if (!isFile(packageJSONPath)) {
    fatalError(
      `Failed to find the "package.json" file at the package root: ${packageRoot}`,
    );
  }

  const nodeModulesPath = path.join(packageRoot, "node_modules");
  console.log(`Removing: ${nodeModulesPath}`);
  rm(nodeModulesPath);
  console.log(`Removed: ${nodeModulesPath}`);

  const packageManager = getPackageManagerForProject(packageRoot);
  const packageManagerLockFileName =
    getPackageManagerLockFileName(packageManager);
  const packageManagerLockFilePath = path.join(
    packageRoot,
    packageManagerLockFileName,
  );
  console.log(`Removing: ${packageManagerLockFilePath}`);
  rm(packageManagerLockFilePath);
  console.log(`Removed: ${packageManagerLockFilePath}`);

  const command = getPackageManagerInstallCommand(packageManager);
  console.log(`Running: ${command}`);
  const commandParts = command.split(" ");
  $.sync`${commandParts}`;
}
