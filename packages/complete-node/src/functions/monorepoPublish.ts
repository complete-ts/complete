import chalk from "chalk";
import { isEnumValue, isSemanticVersion } from "complete-common";
import path from "node:path";
import { dirOfCaller, findPackageRoot } from "./arkType.js";
import { $, $o, $s, $sq } from "./execa.js";
import { isDirectory } from "./file.js";
import { isGitRepositoryClean } from "./git.js";
import {
  updatePackageJSONDependenciesMonorepo,
  updatePackageJSONDependenciesMonorepoChildren,
} from "./monorepoUpdate.js";
import { isLoggedInToNPM } from "./npm.js";
import { getPackageJSONScripts, getPackageJSONVersion } from "./packageJSON.js";
import { echo, exit } from "./scriptHelpers.js";
import { getElapsedSeconds } from "./time.js";
import { fatalError, getArgs } from "./utils.js";

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
  const fromDir = dirOfCaller();
  const monorepoRoot = findPackageRoot(fromDir);

  process.chdir(monorepoRoot);

  const startTime = Date.now();

  // Validate that we are on the correct branch.
  const branch = $o`git branch --show-current`;
  if (branch !== "main") {
    echo("Error: You must be on the main branch before publishing.");
    exit(1);
  }

  if (!isGitRepositoryClean(monorepoRoot)) {
    echo("Error: The Git repository must be clean before publishing.");
    exit(1);
  }

  // Validate that we can push and pull to the repository.
  $s`git pull --quiet`;
  $s`git push --quiet`;

  if (!isLoggedInToNPM()) {
    fatalError(
      `You are not logged into npm. Please run: ${chalk.green("npm adduser")}`,
    );
  }

  const args = getArgs();

  const packageName = args[0];
  if (packageName === undefined || packageName === "") {
    echo("Error: The package name is required as an argument.");
    exit(1);
  }

  const packagePath = path.join(monorepoRoot, "packages", packageName);
  if (!isDirectory(packagePath)) {
    echo(`Error: The directory of "${packagePath}" does not exist.`);
    exit(1);
  }

  const versionBump = args[1];
  if (versionBump === undefined || versionBump === "") {
    echo("Error: The type of version bump is required as an argument.");
    exit(1);
  }

  if (
    !isEnumValue(versionBump, VersionBump) &&
    !isSemanticVersion(versionBump)
  ) {
    echo(`Error: The following version bump is not valid: ${versionBump}`);
    exit(1);
  }

  const $$ = $({ cwd: packagePath });

  // Before bumping the version, check to see if this package builds and lints and tests (so that we
  // can avoid unnecessary version bumps).
  const scripts = getPackageJSONScripts(packagePath);
  if (scripts !== undefined) {
    const promises: Array<Promise<unknown>> = [];

    for (const scriptName of ["build", "lint", "test"]) {
      const scriptCommand = scripts[scriptName];
      if (typeof scriptCommand === "string") {
        promises.push($$`npm run ${scriptName}`);
      }
    }

    await Promise.all(promises);
  }

  /**
   * Normally, the "version" command of the packager manager will automatically make a Git commit
   * for you. However the npm version command is bugged with subdirectories:
   * https://github.com/npm/cli/issues/2010
   *
   * Thus, we manually revert to doing a commit ourselves.
   */
  if (
    isEnumValue(versionBump, VersionBump) &&
    versionBump === VersionBump.dev
  ) {
    $$.sync`npm version prerelease --preid=dev --commit-hooks=false`;
  } else {
    $$.sync`npm version ${versionBump} --commit-hooks=false`;
  }

  // Manually make a Git commit. (See above comment.)
  const packageJSONPath = path.join(packagePath, "package.json");
  $sq`git add ${packageJSONPath}`;
  const newVersion = getPackageJSONVersion(packagePath);
  const tag = `${packageName}-${newVersion}`;
  const commitMessage = `chore(release): ${tag}`;
  $sq`git commit --message ${commitMessage}`;
  $sq`git tag ${tag}`;
  // (Defer doing a "git push" until the end so that we only trigger a single CI run.)

  // Upload the package to npm.
  const npmTag =
    isEnumValue(versionBump, VersionBump) && versionBump === VersionBump.dev
      ? "next"
      : "latest";
  // - The "--access=public" flag is only technically needed for the first publish (unless the
  //   package is a scoped package), but it is saved here for posterity.
  // - The "--ignore-scripts" flag is needed since the "npm publish" command will run the "publish"
  //   script in the "package.json" file, causing an infinite loop.
  $$.sync`npm publish --access=public --ignore-scripts --tag=${npmTag}`;

  const elapsedSeconds = getElapsedSeconds(startTime);
  const secondsText = elapsedSeconds === 1 ? "second" : "seconds";
  const version = getPackageJSONVersion(packagePath);
  console.log(
    `Successfully published package "${chalk.green(
      packageName,
    )}" version "${chalk.green(version)}" in ${elapsedSeconds} ${secondsText}.`,
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

  if (!isGitRepositoryClean(monorepoRoot)) {
    const gitCommitMessage = "chore: updating dependencies";
    $sq`git add --all`;
    $sq`git commit --message ${gitCommitMessage}`;
  }

  $sq`git push`;
}
