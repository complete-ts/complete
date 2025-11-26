/**
 * Helper functions for publishing packages within a [monorepo](https://monorepo.tools/).
 *
 * @module
 */

import chalk from "chalk";
import {
  assertDefined,
  assertStringNotEmpty,
  getElapsedSeconds,
  isEnumValue,
  isSemanticVersion,
} from "complete-common";
import path from "node:path";
import { packageDirectory } from "package-directory";
import { $, $o } from "./execa.js";
import { assertDirectory } from "./file.js";
import { isGitRepositoryClean } from "./git.js";
import {
  updatePackageJSONDependenciesMonorepo,
  updatePackageJSONDependenciesMonorepoChildren,
} from "./monorepoUpdate.js";
import { isLoggedInToNPM } from "./npm.js";
import { getPackageJSONScripts, getPackageJSONVersion } from "./packageJSON.js";
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
  const branchName = await $o`git branch --show-current`;
  // eslint-disable-next-line @typescript-eslint/no-unsafe-enum-comparison
  if (branchName !== "main" && versionBump !== VersionBump.dev) {
    throw new Error("You must be on the main branch before publishing.");
  }

  const isRepositoryCleanOnStart = await isGitRepositoryClean(monorepoRoot);
  if (!isRepositoryCleanOnStart) {
    throw new Error("The Git repository must be clean before publishing.");
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

  // The "--follow-tags" flag is needed because by default, tags are not pushed.
  await $`git push --follow-tags`;
}
