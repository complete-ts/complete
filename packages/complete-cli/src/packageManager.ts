import type { PackageManager } from "complete-node";
import {
  fatalError,
  getPackageManagerLockFileName,
  getPackageManagersForProject,
} from "complete-node";
import { CWD, DEFAULT_PACKAGE_MANAGER } from "./constants.js";

export function getPackageManagerUsedForExistingProject(): PackageManager {
  const packageManagers = getPackageManagersForProject(CWD);
  if (packageManagers.length > 1) {
    const packageManagerLockFileNames = packageManagers
      .map((packageManager) => getPackageManagerLockFileName(packageManager))
      .map((packageManagerLockFileName) => `"${packageManagerLockFileName}"`)
      .join(" & ");
    fatalError(
      `Multiple different kinds of package manager lock files were found (${packageManagerLockFileNames}). You should delete the ones that you are not using so that this program can correctly detect your package manager.`,
    );
  }

  const packageManager = packageManagers[0];
  if (packageManager !== undefined) {
    return packageManager;
  }

  return DEFAULT_PACKAGE_MANAGER;
}
