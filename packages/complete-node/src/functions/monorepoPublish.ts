/**
 * Helper functions for publishing packages within a [monorepo](https://monorepo.tools/).
 *
 * @module
 */

import chalk from "chalk";
import {
  getElapsedSeconds,
  isEnumValue,
  isSemanticVersion,
} from "complete-common";
import path from "node:path";
import { $, $o } from "./execa.js";
import { isDirectory } from "./file.js";
import { isGitRepositoryClean } from "./git.js";
import {
  updatePackageJSONDependenciesMonorepo,
  updatePackageJSONDependenciesMonorepoChildren,
} from "./monorepoUpdate.js";
import { isLoggedInToNPM } from "./npm.js";
import { getPackageJSONScripts, getPackageJSONVersion } from "./packageJSON.js";
import { getPackageRoot } from "./project.js";
import { getArgs } from "./utils.js";

enum VersionBump {
  major = "major",
  minor = "minor",
  patch = "patch",
  dev = "dev",
}

/**
 * Helper function to publish one of a monorepo's packages to npm.
 *
 * This function attempts to find the monorepo root directory automatically based on searching
 * backwards from the file of the calling function.
 *
 * @param updateMonorepo Optional. Attempt to update the monorepo dependencies after the publish is
 *                       completed. Defaults to true.
 */
export async function monorepoPublish(updateMonorepo = true): Promise<void> {
  const monorepoRoot = await getPackageRoot(2);

  process.chdir(monorepoRoot);

  const startTime = Date.now();

  // Validate command-line arguments
  const args = getArgs();

  const packageName = args[0];
  if (packageName === undefined || packageName === "") {
    console.error("Error: The package name is required as an argument.");
    process.exit(1);
  }

  const packagePath = path.join(monorepoRoot, "packages", packageName);
  const directory = await isDirectory(packagePath);
  if (!directory) {
    console.error(`Error: The directory of "${packagePath}" does not exist.`);
    process.exit(1);
  }

  const versionBump = args[1];
  if (versionBump === undefined || versionBump === "") {
    console.error(
      "Error: The type of version bump is required as an argument.",
    );
    process.exit(1);
  }

  if (
    !isEnumValue(versionBump, VersionBump)
    && !isSemanticVersion(versionBump)
  ) {
    console.error(
      `Error: The following version bump is not valid: ${versionBump}`,
    );
    process.exit(1);
  }

  // Validate that we are on the correct branch. (Allow bumping dev on a branch so that we can avoid
  // polluting the main branch.)
  const branchName = await $o`git branch --show-current`;
  // eslint-disable-next-line @typescript-eslint/no-unsafe-enum-comparison
  if (branchName !== "main" && versionBump !== VersionBump.dev) {
    console.error("Error: You must be on the main branch before publishing.");
    process.exit(1);
  }

  const isRepositoryCleanOnStart = await isGitRepositoryClean(monorepoRoot);
  if (!isRepositoryCleanOnStart) {
    console.error("Error: The Git repository must be clean before publishing.");
    process.exit(1);
  }

  // Validate that we can push and pull to the repository.
  await $`git pull --quiet`;
  await $`git push --quiet`;

  const isLoggedIn = await isLoggedInToNPM();
  if (!isLoggedIn) {
    throw new Error(
      `You are not logged into npm. Please run: ${chalk.green("npm adduser")}`,
    );
  }

  const $$ = $({ cwd: packagePath });

  // Before bumping the version, check to see if this package builds and lints and tests (so that we
  // can avoid unnecessary version bumps).
  const scripts = await getPackageJSONScripts(packagePath);
  if (scripts !== undefined) {
    await Promise.all(
      ["build", "lint", "test"].map(async (scriptName) => {
        const scriptCommand = scripts[scriptName];
        if (typeof scriptCommand === "string") {
          await $$`npm run ${scriptName}`;
        }
      }),
    );
  }

  /**
   * Normally, the "version" command of the packager manager will automatically make a Git commit
   * for you. However the npm version command is bugged with subdirectories:
   * https://github.com/npm/cli/issues/2010
   *
   * Thus, we manually revert to doing a commit ourselves.
   */
  const isDev =
    isEnumValue(versionBump, VersionBump) && versionBump === VersionBump.dev;
  await (isDev
    ? $$`npm version prerelease --preid=dev --commit-hooks=false`
    : $$`npm version ${versionBump} --commit-hooks=false`);

  // Manually make a Git commit. (See above comment.)
  const packageJSONPath = path.join(packagePath, "package.json");
  await $`git add ${packageJSONPath}`;
  const newVersion = await getPackageJSONVersion(packagePath);
  const tag = `${packageName}-${newVersion}`;
  const commitMessage = `chore(release): ${tag}`;
  await $`git commit --message ${commitMessage}`;
  await $`git tag ${tag}`;
  // (Defer doing a "git push" until the end so that we only trigger a single CI run.)

  // Upload the package to npm.
  const npmTag = isDev ? "next" : "latest";
  // - The "--access=public" flag is only technically needed for the first publish (unless the
  //   package is a scoped package), but it is saved here for posterity.
  // - The "--ignore-scripts" flag is needed since the "npm publish" command will run the "publish"
  //   script in the "package.json" file, causing an infinite loop.
  await $$`npm publish --access=public --ignore-scripts --tag=${npmTag}`;

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

  const isRepositoryCleanOnFinish = await isGitRepositoryClean(monorepoRoot);
  if (!isRepositoryCleanOnFinish) {
    const gitCommitMessage = "chore: updating dependencies";
    await $`git add --all`;
    await $`git commit --message ${gitCommitMessage}`;
  }

  await $`git push`;
}
