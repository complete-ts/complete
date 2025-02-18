import { Command, Option } from "clipanion";
import { isSemanticVersion } from "complete-common";
import type { PackageManager } from "complete-node";
import {
  $,
  $s,
  fatalError,
  getPackageJSONField,
  getPackageJSONVersion,
  getPackageManagerInstallCommand,
  isFile,
  isGitRepository,
  isGitRepositoryClean,
  isLoggedInToNPM,
  readFile,
  updatePackageJSONDependencies,
  writeFile,
} from "complete-node";
import path from "node:path";
import { CWD } from "../constants.js";
import { getPackageManagerUsedForExistingProject } from "../packageManager.js";

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

  // eslint-disable-next-line @typescript-eslint/require-await
  async execute(): Promise<void> {
    validate();
    prePublish(
      this.versionBumpType,
      this.dryRun,
      this.skipLint,
      this.skipUpdate,
    );
    publish(this.dryRun);
  }
}

function validate() {
  if (!isGitRepository(CWD)) {
    fatalError(
      "Failed to publish since the current working directory is not inside of a git repository.",
    );
  }

  if (!isGitRepositoryClean(CWD)) {
    fatalError(
      "Failed to publish since the Git repository was dirty. Before publishing, you must push any current changes to git. (Version commits should not contain any code changes.)",
    );
  }

  if (!isFile("package.json")) {
    fatalError(
      'Failed to find the "package.json" file in the current working directory.',
    );
  }

  if (!isLoggedInToNPM()) {
    fatalError(
      'Failed to publish since you are not logged in to npm. Try doing "npm login".',
    );
  }
}

/**
 * Before uploading the project, we want to update dependencies, increment the version, and perform
 * some other steps.
 */
function prePublish(
  versionBumpType: string,
  dryRun: boolean,
  skipLint: boolean,
  skipUpdate: boolean,
) {
  const packageManager = getPackageManagerUsedForExistingProject();

  $s`git pull --rebase`;
  $s`git push`;
  updateDependencies(skipUpdate, dryRun, packageManager);
  incrementVersion(versionBumpType);
  unsetDevelopmentConstants();

  tryRunNPMScript("build");
  if (!skipLint) {
    tryRunNPMScript("lint");
  }
}

function updateDependencies(
  skipUpdate: boolean,
  dryRun: boolean,
  packageManager: PackageManager,
) {
  if (skipUpdate) {
    return;
  }

  console.log('Updating dependencies in the "package.json" file...');
  const hasNewDependencies = updatePackageJSONDependencies(undefined);
  if (hasNewDependencies) {
    const command = getPackageManagerInstallCommand(packageManager);
    const commandParts = command.split(" ");
    $s`${commandParts}`;
    if (!dryRun) {
      gitCommitAllAndPush("chore: update dependencies");
    }
  }
}

function gitCommitAllAndPush(message: string) {
  $s`git add --all`;
  $s`git commit --message ${message}`;
  $s`git push`;
  console.log(
    `Committed and pushed to the git repository with a message of: ${message}`,
  );
}

function incrementVersion(versionBumpType: string) {
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
  $s`npm version ${versionBumpType} --no-git-tag-version`;
}

function unsetDevelopmentConstants() {
  const constantsTSPath = path.join(CWD, "src", "constants.ts");
  if (!isFile(constantsTSPath)) {
    return;
  }

  const constantsTS = readFile(constantsTSPath);
  const newConstantsTS = constantsTS
    .replace("const IS_DEV = true", "const IS_DEV = false")
    .replace("const DEBUG = true", "const DEBUG = false");
  writeFile(constantsTSPath, newConstantsTS);
}

function tryRunNPMScript(scriptName: string) {
  console.log(`Running: ${scriptName}`);

  const $$ = $({
    reject: false,
  });
  const { exitCode } = $$.sync`npm run ${scriptName}`;

  if (exitCode !== 0) {
    $s`git reset --hard`; // Revert the version changes.
    fatalError(`Failed to run "${scriptName}".`);
  }
}

function publish(dryRun: boolean) {
  const projectName = getPackageJSONField(undefined, "name");
  const version = getPackageJSONVersion(undefined);

  if (dryRun) {
    $s`git reset --hard`; // Revert the version changes.
  } else {
    const releaseGitCommitMessage = getReleaseGitCommitMessage(version);
    gitCommitAllAndPush(releaseGitCommitMessage);

    // - The "--access=public" flag is only technically needed for the first publish (unless the
    //   package is a scoped package), but it is saved here for posterity.
    // - The "--ignore-scripts" flag is needed since the "npm publish" command will run the
    //   "publish" script in the "package.json" file, causing an infinite loop.
    $s`npm publish --access=public --ignore-scripts`;
  }

  const dryRunSuffix = dryRun ? " (dry-run)" : "";
  console.log(
    `Published ${projectName} version ${version} successfully${dryRunSuffix}.`,
  );
}

function getReleaseGitCommitMessage(version: string): string {
  return `chore: release ${version}`;
}
