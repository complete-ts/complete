import { Command, Option } from "clipanion";
import { isSemanticVersion } from "complete-common";
import type { PackageManager } from "complete-node";
import {
  fatalError,
  getPackageJSONField,
  getPackageJSONVersion,
  getPackageManagerInstallCommand,
  getPackageManagerLockFileName,
  getPackageManagersForProject,
  isFileAsync,
  isGitRepository,
  isGitRepositoryClean,
  isLoggedInToNPM,
  readFile,
  updatePackageJSONDependencies,
  writeFileAsync,
} from "complete-node";
import { $ } from "execa";
import path from "node:path";
import { CWD, DEFAULT_PACKAGE_MANAGER } from "../constants.js";

export class PublishCommand extends Command {
  static override paths = [["publish"], ["p"]];

  // The first positional argument.
  versionBumpType = Option.String({
    required: true,
  });

  dryRun = Option.Boolean("--dry-run", false, {
    description: "Skip committing/uploading & perform a Git reset afterward.",
  });

  skipLint = Option.Boolean("--skip-lint", false, {
    description: "Skip linting before publishing.",
  });

  skipUpdate = Option.Boolean("--skip-update", false, {
    description: "Skip updating the npm dependencies.",
  });

  static override usage = Command.Usage({
    description: "Bump the version & publish a new release.",
  });

  async execute(): Promise<void> {
    await validate();
    await prePublish(
      this.versionBumpType,
      this.dryRun,
      this.skipLint,
      this.skipUpdate,
    );
    await publish(this.dryRun);
  }
}

async function validate() {
  const isRepository = await isGitRepository(CWD);
  if (!isRepository) {
    fatalError(
      "Failed to publish since the current working directory is not inside of a git repository.",
    );
  }

  const isRepositoryClean = await isGitRepositoryClean(CWD);
  if (!isRepositoryClean) {
    fatalError(
      "Failed to publish since the Git repository was dirty. Before publishing, you must push any current changes to git. (Version commits should not contain any code changes.)",
    );
  }

  const packageJSONExists = await isFileAsync("package.json");
  if (!packageJSONExists) {
    fatalError(
      'Failed to find the "package.json" file in the current working directory.',
    );
  }

  const isLoggedIn = await isLoggedInToNPM();
  if (!isLoggedIn) {
    fatalError(
      'Failed to publish since you are not logged in to npm. Try doing "npm login".',
    );
  }
}

/**
 * Before uploading the project, we want to update dependencies, increment the version, and perform
 * some other steps.
 */
async function prePublish(
  versionBumpType: string,
  dryRun: boolean,
  skipLint: boolean,
  skipUpdate: boolean,
) {
  const packageManager = getPackageManagerUsedForExistingProject();

  await $`git pull --rebase`;
  await $`git push`;
  await updateDependencies(skipUpdate, dryRun, packageManager);
  await incrementVersion(versionBumpType);
  await unsetDevelopmentConstants();

  await tryRunNPMScript("build");
  if (!skipLint) {
    await tryRunNPMScript("lint");
  }
}

function getPackageManagerUsedForExistingProject(): PackageManager {
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

async function updateDependencies(
  skipUpdate: boolean,
  dryRun: boolean,
  packageManager: PackageManager,
) {
  if (skipUpdate) {
    return;
  }

  console.log('Updating dependencies in the "package.json" file...');
  const hasNewDependencies = await updatePackageJSONDependencies(undefined);
  if (hasNewDependencies) {
    const command = getPackageManagerInstallCommand(packageManager);
    const commandParts = command.split(" ");
    await $`${commandParts}`;
    if (!dryRun) {
      await gitCommitAllAndPush("chore: update dependencies");
    }
  }
}

async function gitCommitAllAndPush(message: string) {
  await $`git add --all`;
  await $`git commit --message ${message}`;
  await $`git push`;
  console.log(
    `Committed and pushed to the git repository with a message of: ${message}`,
  );
}

async function incrementVersion(versionBumpType: string) {
  if (versionBumpType === "none") {
    return;
  }

  if (versionBumpType === "dev") {
    throw new Error(
      'The version bump type of "dev" is not currently supported.',
    );
  }

  if (
    versionBumpType !== "major" &&
    versionBumpType !== "minor" &&
    versionBumpType !== "patch" &&
    versionBumpType !== "dev" &&
    !isSemanticVersion(versionBumpType)
  ) {
    fatalError(
      'The version must be one of "major", "minor", "patch", "dev", "none", or a specific semantic version like "1.2.3".',
    );
  }

  // We always use `npm` here to avoid differences with the version command between package
  // managers. The "--no-git-tag-version" flag will prevent npm from both making a commit and adding
  // a tag.
  await $`npm version ${versionBumpType} --no-git-tag-version`;
}

async function unsetDevelopmentConstants() {
  const constantsTSPath = path.join(CWD, "src", "constants.ts");
  const constantsTSExists = await isFileAsync(constantsTSPath);
  if (!constantsTSExists) {
    return;
  }

  const constantsTS = readFile(constantsTSPath);
  const newConstantsTS = constantsTS
    .replace("const IS_DEV = true", "const IS_DEV = false")
    .replace("const DEBUG = true", "const DEBUG = false");
  await writeFileAsync(constantsTSPath, newConstantsTS);
}

async function tryRunNPMScript(scriptName: string) {
  console.log(`Running: ${scriptName}`);

  const $$ = $({
    reject: false,
  });
  const { exitCode } = await $$`npm run ${scriptName}`;

  if (exitCode !== 0) {
    await $`git reset --hard`; // Revert the version changes.
    fatalError(`Failed to run "${scriptName}".`);
  }
}

async function publish(dryRun: boolean) {
  const projectName = getPackageJSONField(undefined, "name");
  const version = getPackageJSONVersion(undefined);

  if (dryRun) {
    await $`git reset --hard`; // Revert the version changes.
  } else {
    const releaseGitCommitMessage = getReleaseGitCommitMessage(version);
    await gitCommitAllAndPush(releaseGitCommitMessage);

    // - The "--access=public" flag is only technically needed for the first publish (unless the
    //   package is a scoped package), but it is saved here for posterity.
    // - The "--ignore-scripts" flag is needed since the "npm publish" command will run the
    //   "publish" script in the "package.json" file, causing an infinite loop.
    await $`npm publish --access=public --ignore-scripts`;
  }

  const dryRunSuffix = dryRun ? " (dry-run)" : "";
  console.log(
    `Published ${projectName} version ${version} successfully${dryRunSuffix}.`,
  );
}

function getReleaseGitCommitMessage(version: string): string {
  return `chore: release ${version}`;
}
