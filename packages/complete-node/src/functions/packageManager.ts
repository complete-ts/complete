/**
 * Helper functions for JavaScript/TypeScript package managers.
 *
 * @module
 */

import { getEnumValues, mapAsync } from "complete-common";
import path from "node:path";
import { PackageManager } from "../enums/PackageManager.js";
import { isFile } from "./file.js";

const PACKAGE_MANAGER_VALUES = getEnumValues(PackageManager);

const PACKAGE_MANAGER_TO_LOCK_FILE_NAME = {
  [PackageManager.npm]: "package-lock.json",
  [PackageManager.yarn]: "yarn.lock",
  [PackageManager.pnpm]: "pnpm-lock.yaml",
  [PackageManager.bun]: "bun.lock",
} as const satisfies Record<PackageManager, string>;

const PACKAGE_MANAGER_LOCK_FILE_NAMES: readonly string[] = Object.values(
  PACKAGE_MANAGER_TO_LOCK_FILE_NAME,
);

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
  [PackageManager.bun]: "bun ci",
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
 * Helper function to look at the lock files in a given directory in order to infer the package
 * manager being used for the project.
 *
 * @throws If two or more lock files were found.
 */
export async function getPackageManagerForProject(
  packageRoot: string,
): Promise<PackageManager | undefined> {
  const packageManagers = await getPackageManagersForProject(packageRoot);

  switch (packageManagers.length) {
    case 0: {
      return undefined;
    }

    case 1: {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      return packageManagers[0]!;
    }

    default: {
      throw new Error(
        `${packageManagers.length} different package manager lock files exist at "${packageRoot}". You should delete the ones that you are not using so that this program can correctly detect your package manager.`,
      );
    }
  }
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
  return PACKAGE_MANAGER_LOCK_FILE_NAMES;
}

/**
 * Helper function to look at the lock files in a given directory in order to detect the package
 * manager being used for the project.
 *
 * Since 2 or more different kinds of lock files can exist, this will return an array containing all
 * of the package managers found. If no lock files were found, this will return an empty array.
 */
export async function getPackageManagersForProject(
  packageDir: string,
): Promise<readonly PackageManager[]> {
  const fileChecks = await mapAsync(
    PACKAGE_MANAGER_VALUES,
    async (packageManager) => {
      const lockFileName = PACKAGE_MANAGER_TO_LOCK_FILE_NAME[packageManager];
      const lockFilePath = path.join(packageDir, lockFileName);
      const lockFileExists = await isFile(lockFilePath);

      return {
        packageManager,
        lockFileExists,
      };
    },
  );

  return fileChecks
    .filter((check) => check.lockFileExists)
    .map((check) => check.packageManager);
}
