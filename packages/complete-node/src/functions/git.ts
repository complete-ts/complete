/**
 * Helper functions for working with [Git](https://git-scm.com/).
 *
 * @module
 */

import { $q } from "./execa.js";

/** Helper function to get the current branch for a Git repository. */
export async function getGitBranch(gitRepositoryPath: string): Promise<string> {
  const $$q = $q({ cwd: gitRepositoryPath });
  const { stdout } = await $$q`git branch --show-current`;

  return stdout;
}

/**
 * Helper function to determine whether the given directory inside of a Git repository is "clean",
 * meaning has no unchanged files from the head.
 *
 * - If given the root of a Git repository, it will check the entire repository.
 * - If given a subdirectory of a Git repository, it will check for only changes in that directory.
 *
 * @throws If the provided directory is not inside of a Git repository.
 */
export async function isGitDirectoryClean(
  directoryPath: string,
): Promise<boolean> {
  const gitRepository = await isGitRepository(directoryPath);
  if (!gitRepository) {
    throw new Error(
      `The directory of "${directoryPath}" is not inside of a Git repository.`,
    );
  }

  const $$q = $q({ cwd: directoryPath });
  // The "." argument restricts the status check to the current working directory.
  const { stdout: gitStatusOutput } = await $$q`git status --porcelain .`;
  return gitStatusOutput === "";
}

/** Helper function to determine whether the given path is inside of a Git repository. */
export async function isGitRepository(
  gitRepositoryPath: string,
): Promise<boolean> {
  const $$q = $q({ cwd: gitRepositoryPath });
  const result = await $$q`git rev-parse --is-inside-work-tree`;
  return result.exitCode === 0;
}

/** Helper function to determine whether the given Git repository is up to date with the remote. */
export async function isGitRepositoryLatestCommit(
  gitRepositoryPath: string,
): Promise<boolean> {
  const $$q = $q({ cwd: gitRepositoryPath });
  await $$q`git fetch`;

  const { stdout: currentSHA1 } = await $$q`git rev-parse HEAD`;
  const { stdout: latestSHA1 } = await $$q`git rev-parse @{u}`;

  return currentSHA1 === latestSHA1;
}
