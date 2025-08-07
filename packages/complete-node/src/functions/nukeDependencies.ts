import path from "node:path";
import { PackageManager } from "../enums/PackageManager.js";
import { $ } from "./execa.js";
import { deleteFileOrDirectory, isFile } from "./file.js";
import {
  getPackageManagerForProject,
  getPackageManagerInstallCommand,
  getPackageManagerLockFileName,
} from "./packageManager.js";

/**
 * Helper function to:
 *
 * - delete the "node_modules" directory
 * - delete any package manager lock files that exist
 * - reinstall the dependencies using the detected package manager (defaulting to npm if there was
 *   no detected package manager)
 *
 * This will attempt to validate that the directory is correct by looking for a "package.json" file.
 * If not found, this function will print an error message and exit.
 *
 * @param packageRoot The path to the directory that contains the "package.json" file and the
 *                    "node_modules" directory. If undefined is passed, the current working
 *                    directory will be used.
 * @returns Whether any dependencies were updated.
 */
export async function nukeDependencies(packageRoot?: string): Promise<void> {
  packageRoot ??= process.cwd(); // eslint-disable-line no-param-reassign

  const packageJSONPath = path.join(packageRoot, "package.json");
  const packageJSONExists = await isFile(packageJSONPath);
  if (!packageJSONExists) {
    throw new Error(
      `Failed to find the "package.json" file at the package root: ${packageRoot}`,
    );
  }

  const nodeModulesPath = path.join(packageRoot, "node_modules");
  console.log(`Removing: ${nodeModulesPath}`);
  await deleteFileOrDirectory(nodeModulesPath);
  console.log(`Removed: ${nodeModulesPath}`);

  const packageManager =
    (await getPackageManagerForProject(packageRoot)) ?? PackageManager.npm;
  const packageManagerLockFileName =
    getPackageManagerLockFileName(packageManager);
  const packageManagerLockFilePath = path.join(
    packageRoot,
    packageManagerLockFileName,
  );
  console.log(`Removing: ${packageManagerLockFilePath}`);
  await deleteFileOrDirectory(packageManagerLockFilePath);
  console.log(`Removed: ${packageManagerLockFilePath}`);

  const command = getPackageManagerInstallCommand(packageManager);
  console.log(`Running: ${command}`);
  const commandParts = command.split(" ");
  $.sync`${commandParts}`;
}
