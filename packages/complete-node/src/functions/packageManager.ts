/**
 * Helper functions for JavaScript/TypeScript package managers.
 *
 * @module
 */

import { assertDefined } from "complete-common";
import path from "node:path";
import { PACKAGE_MANAGER_VALUES } from "../cachedEnumValues.js";
import { PackageManager } from "../enums/PackageManager.js";
import { isFile } from "./file.js";

const PACKAGE_MANAGER_TO_LOCK_FILE_NAME = {
  [PackageManager.npm]: "package-lock.json",
  [PackageManager.yarn]: "yarn.lock",
  [PackageManager.pnpm]: "pnpm-lock.yaml",
  [PackageManager.bun]: "bun.lockb",
} as const satisfies Record<PackageManager, string>;

const PACKAGE_MANAGER_EXEC_COMMANDS = {
  [PackageManager.npm]: "npx",
  [PackageManager.yarn]: "npx",
  [PackageManager.pnpm]: "pnpm exec",
  [PackageManager.bun]: "bunx",
} as const satisfies Record<PackageManager, string>;

const PACKAGE_MANAGER_INSTALL_CI_COMMANDS = {
  [PackageManager.npm]: "npm ci",
  [PackageManager.yarn]: "yarn install --immutable",
  [PackageManager.pnpm]: "pnpm install --frozen-lockfile",
  [PackageManager.bun]: "bun install --frozen-lockfile",
} as const satisfies Record<PackageManager, string>;

/**
 * Helper function to get the add command for a package manager. For example, the command for npm
 * is: `npm install foo --save`
 */
export function getPackageManagerAddCommand(
  packageManager: PackageManager,
  dependency: string,
): string {
  switch (packageManager) {
    case PackageManager.npm: {
      return `npm install ${dependency} --save`;
    }

    case PackageManager.yarn: {
      return `yarn add ${dependency}`;
    }

    case PackageManager.pnpm: {
      return `pnpm add ${dependency}`;
    }

    case PackageManager.bun: {
      return `bun add ${dependency}`;
    }
  }
}

/**
 * Helper function to get the add development command for a package manager. For example, the
 * command for npm is: `npm install foo --save-dev`
 */
export function getPackageManagerAddDevCommand(
  packageManager: PackageManager,
  dependency: string,
): string {
  switch (packageManager) {
    case PackageManager.npm: {
      return `npm install ${dependency} --save-dev`;
    }

    case PackageManager.yarn: {
      return `yarn add ${dependency} --dev`;
    }

    case PackageManager.pnpm: {
      return `pnpm add ${dependency} --save-dev`;
    }

    case PackageManager.bun: {
      return `bun add ${dependency} --dev`;
    }
  }
}

/**
 * Helper function to get the exec command for a package manager. For example, the command for npm
 * is: `npx`
 */
export function getPackageManagerExecCommand(
  packageManager: PackageManager,
): string {
  return PACKAGE_MANAGER_EXEC_COMMANDS[packageManager];
}

/**
 * Helper function to look at the lock files in a given directory in order to detect the package
 * manager being used for the project.
 *
 * Since 2 or more different kinds of lock files can exist, this will throw an error if 0 lock files
 * are found or if 2 or more lock files are found.
 */
export function getPackageManagerForProject(
  packageRoot: string,
): PackageManager {
  const packageManagers = getPackageManagersForProject(packageRoot);
  if (packageManagers.length > 1) {
    throw new Error(
      `${
        packageManagers.length
      } different package manager lock files exist at "${packageRoot}". You should delete the ones that you are not using so that this program can correctly detect your package manager.`,
    );
  }

  const packageManager = packageManagers[0];
  assertDefined(
    packageManager,
    `No package manager lock files exist at "${packageRoot}". You should install dependencies using the package manager of your choice so that this program can correctly detect your package manager.`,
  );

  return packageManager;
}

/**
 * Helper function to get the continuous integration install command for a package manager. For
 * example, the command for npm is: `npm ci`
 */
export function getPackageManagerInstallCICommand(
  packageManager: PackageManager,
): string {
  return PACKAGE_MANAGER_INSTALL_CI_COMMANDS[packageManager];
}

/**
 * Helper function to get the install command for a package manager. For example, the command for
 * npm is: `npm install`
 */
export function getPackageManagerInstallCommand(
  packageManager: PackageManager,
): string {
  return `${packageManager} install`;
}

/**
 * Helper function to get the corresponding lock file name for a package manager. For example, the
 * package lock file for npm is "package-lock.json".
 */
export function getPackageManagerLockFileName(
  packageManager: PackageManager,
): string {
  return PACKAGE_MANAGER_TO_LOCK_FILE_NAME[packageManager];
}

/** Helper function to get an array containing every package manager lock file name. */
export function getPackageManagerLockFileNames(): readonly string[] {
  return Object.values(PACKAGE_MANAGER_TO_LOCK_FILE_NAME);
}

/**
 * Helper function to look at the lock files in a given directory in order to detect the package
 * manager being used for the project.
 *
 * Since 2 or more different kinds of lock files can exist, this will return an array containing all
 * of the package managers found. If no lock files were found, this will return an empty array.
 */
export function getPackageManagersForProject(
  packageDir: string,
): readonly PackageManager[] {
  const packageManagersFound: PackageManager[] = [];

  for (const packageManager of PACKAGE_MANAGER_VALUES) {
    const lockFileName = getPackageManagerLockFileName(packageManager);
    const lockFilePath = path.join(packageDir, lockFileName);
    if (isFile(lockFilePath)) {
      packageManagersFound.push(packageManager);
    }
  }

  return packageManagersFound;
}
