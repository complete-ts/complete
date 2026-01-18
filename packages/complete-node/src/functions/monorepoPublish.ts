/**
 * Helper functions for publishing packages within a [monorepo](https://monorepo.tools/).
 *
 * @module
 */

import { versionBumpInfo } from "bumpp";
import chalk from "chalk";
import {
  assertDefined,
  assertStringNotEmpty,
  getElapsedSeconds,
  isEnumValue,
  isSemanticVersion,
  mapAsync,
} from "complete-common";
import path from "node:path";
import { packageDirectory } from "package-directory";
import { PackageManager } from "../enums/PackageManager.js";
import { $ } from "./execa.js";
import { assertDirectory } from "./file.js";
import { getGitBranch, isGitDirectoryClean } from "./git.js";
import {
  updatePackageJSONDependenciesMonorepo,
  updatePackageJSONDependenciesMonorepoChildren,
} from "./monorepoUpdate.js";
import { getPackageJSONScripts, getPackageJSONVersion } from "./packageJSON.js";
import { getPackageManagerForProject } from "./packageManager.js";
import { getArgs } from "./utils.js";

enum VersionBump {
  major = "major",
  minor = "minor",
  patch = "patch",
  dev = "dev",
}

const PACKAGE_SCRIPTS_THAT_MUST_PASS = ["build", "lint", "test"] as const;

/**
 * Helper function to publish one of a monorepo's packages to npm.
 *
 * This function attempts to find the monorepo root directory automatically based on searching
 * backwards from the file of the calling function.
 *
 * @param importMetaDirname The value of `import.meta.dirname` (so that this function can find the
 *                          package root).
 * @param updateMonorepo Optional. Attempt to update the monorepo dependencies after the publish is
 *                       completed. Defaults to true.
 * @throws If publishing fails.
 */
export async function monorepoPublish(
  importMetaDirname: string,
  updateMonorepo = true,
): Promise<void> {
  const monorepoRoot = await packageDirectory({ cwd: importMetaDirname });
  assertDefined(
    monorepoRoot,
    `Failed to find the package root from the directory of: ${monorepoRoot}`,
  );

  process.chdir(monorepoRoot);
  const startTime = Date.now();

  // Validate command-line arguments
  const args = getArgs();
  const [packageName, versionBump] = args;

  assertStringNotEmpty(
    packageName,
    "The package name is required as an argument.",
  );

  const packagePath = path.join(monorepoRoot, "packages", packageName);
  await assertDirectory(
    packagePath,
    `The directory of "${packagePath}" does not exist.`,
  );

  assertStringNotEmpty(
    versionBump,
    "Error: The type of version bump is required as an argument.",
  );

  if (
    !isEnumValue(versionBump, VersionBump)
    && !isSemanticVersion(versionBump)
  ) {
    throw new Error(`The following version bump is not valid: ${versionBump}`);
  }

  // Validate that we are on the correct branch. (Allow bumping dev on a branch so that we can avoid
  // polluting the main branch.)
  const branchName = await getGitBranch(monorepoRoot);
  // eslint-disable-next-line @typescript-eslint/no-unsafe-enum-comparison
  if (branchName !== "main" && versionBump !== VersionBump.dev) {
    throw new Error("You must be on the main branch before publishing.");
  }

  const isRepositoryCleanOnStart = await isGitDirectoryClean(monorepoRoot);
  if (!isRepositoryCleanOnStart) {
    throw new Error("The Git repository must be clean before publishing.");
  }

  const $monorepo = $({ cwd: monorepoRoot });
  const $package = $({ cwd: packagePath });

  // Validate that we can push and pull to the repository.
  await $monorepo`git pull --quiet`;
  await $monorepo`git push --quiet`;

  // Validate that we can detect the package manager.
  const packageManager = await getPackageManagerForProject(monorepoRoot);
  assertDefined(
    packageManager,
    `Failed to get the package manager for the monorepo at directory: ${monorepoRoot}`,
  );

  // Before bumping the version, check to see if this package builds and lints and tests (so that we
  // can avoid unnecessary version bumps).
  const scripts = await getPackageJSONScripts(packagePath);
  if (scripts !== undefined) {
    await mapAsync(PACKAGE_SCRIPTS_THAT_MUST_PASS, async (scriptName) => {
      const scriptCommand = scripts[scriptName];
      if (typeof scriptCommand === "string") {
        await $package`${packageManager} run ${scriptName}`;
      }
    });
  }

  const isDev =
    isEnumValue(versionBump, VersionBump) && versionBump === VersionBump.dev;

  const versionBumpOperation = await versionBumpInfo({
    release: isDev ? "prerelease" : versionBump, // Defaults to "prompt".
    preid: isDev ? "dev" : undefined, // Defaults to "beta".
    commit: false, // Defaults to true.
    tag: false, // Defaults to true.
    confirm: false, // Defaults to true.
    cwd: packagePath,
  });
  if (versionBumpOperation.results.updatedFiles.length === 0) {
    throw new Error("Failed to bump the version.");
  }

  // Update the lock file.
  await $monorepo`bun install`;

  // Manually make a Git commit.
  const packageJSONPath = path.join(packagePath, "package.json");
  await $monorepo`git add ${packageJSONPath}`;
  const newVersion = await getPackageJSONVersion(packagePath);
  const tag = `${packageName}-${newVersion}`;
  const commitMessage = `chore: release ${tag}`;
  await $monorepo`git commit --message ${commitMessage}`;
  // By default, "git tag" will create a lightweight tag instead of an annotated tag unless the
  // "--annotate" flag is provided. Annotated tags are preferred because:
  // - Software releases are conventionally done with annotated tags since they can store metadata
  //   and be GPG signed.
  // - Annotated tags will work properly with "git push --follow-tags".
  await $monorepo`git tag --annotate ${tag} --message ${commitMessage}`;
  // (Defer doing a "git push" until the end so that we only trigger a single CI run.)

  // Upload the package to npm.
  const command = packageManager === PackageManager.bun ? "bun" : "npm";
  const npmTag = isDev ? "next" : "latest";
  // - The "--access=public" flag is only technically needed for the first publish (unless the
  //   package is a scoped package), but it is saved here for posterity.
  // - The "--ignore-scripts" flag is needed since the "npm publish" command will run the "publish"
  //   script in the "package.json" file, causing an infinite loop.
  await $package`${command} publish --access=public --ignore-scripts --tag=${npmTag}`;

  const elapsedSeconds = getElapsedSeconds(startTime);
  const secondsText = elapsedSeconds === 1 ? "second" : "seconds";
  console.log(
    `Successfully published package "${chalk.green(
      packageName,
    )}" version "${chalk.green(newVersion)}" in ${elapsedSeconds} ${secondsText}.`,
  );

  if (updateMonorepo) {
    // Finally, check for dependency updates to ensure that we keep the monorepo up to date.
    console.log("Checking for monorepo updates...");
    await updatePackageJSONDependenciesMonorepo(monorepoRoot);
  } else {
    // Even though we are not updating the dependencies in the root "package.json" file, we still
    // have to bump the version of monorepo packages that are in other package's "package.json"
    // files.
    await updatePackageJSONDependenciesMonorepoChildren(monorepoRoot);
  }

  const isRepositoryCleanOnFinish = await isGitDirectoryClean(monorepoRoot);
  if (!isRepositoryCleanOnFinish) {
    const gitCommitMessage = "chore: updating dependencies";
    await $monorepo`git add --all`;
    await $monorepo`git commit --message ${gitCommitMessage}`;
  }

  // The "--follow-tags" flag is needed because by default, tags are not pushed.
  await $monorepo`git push --follow-tags`;
}
