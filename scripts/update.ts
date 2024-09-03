import {
  $s,
  echo,
  isMain,
  updateMonorepoSelfDependencies,
  updatePackageJSON,
} from "complete-node";
import path from "node:path";

const REPO_ROOT = path.join(import.meta.dirname, "..");

if (isMain()) {
  updateMonorepo();
}

export function updateMonorepo(): void {
  // Certain monorepo packages are dependant on other monorepo packages, so check to see if those
  // are all up to date first. (This is independent of the root "package.json" file.)
  const updatedSelfDependencies = updateMonorepoSelfDependencies();

  const hasNewDependencies = updatePackageJSON(REPO_ROOT);
  if (hasNewDependencies) {
    // Now that the main dependencies have changed, we might need to update the "package.json" files
    // in the individual packages. However, we don't want to blow away "peerDependencies", since
    // they are in the form of ">= 5.0.0". Thus, we specify "--types prod,dev" to exclude syncing
    // "peerDependencies".
    $s`syncpack fix-mismatches --types prod,dev`;
  }

  if (updatedSelfDependencies || hasNewDependencies) {
    echo("Updated to the latest dependencies.");
  } else {
    echo("No new updates.");
  }
}
