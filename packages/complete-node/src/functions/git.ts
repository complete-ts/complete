/**
 * Helper functions for working with [Git](https://git-scm.com/).
 *
 * @module
 */

import { $ } from "execa";

/** Helper function to determine whether the given path is inside of a Git repository. */
export async function isGitRepository(
  gitRepositoryPath: string,
): Promise<boolean> {
  const $$ = $({ cwd: gitRepositoryPath });
  const result = await $$`git rev-parse --is-inside-work-tree`;
  return result.exitCode === 0;
}

/**
 * Helper function to determine whether the given Git repository is "clean", meaning has no
 * unchanged files from the head.
 */
export async function isGitRepositoryClean(
  gitRepositoryPath: string,
): Promise<boolean> {
  const $$ = $({ cwd: gitRepositoryPath });
  const { stdout: gitStatus } = await $$`git status --porcelain`;
  return gitStatus === "";
}

/** Helper function to determine whether the given Git repository is up to date with the remote. */
export async function isGitRepositoryLatestCommit(
  gitRepositoryPath: string,
): Promise<boolean> {
  const $$ = $({ cwd: gitRepositoryPath });
  await $$`git fetch`;

  const { stdout: currentSHA1 } = await $$`git rev-parse HEAD`;
  const { stdout: latestSHA1 } = await $$`git rev-parse @{u}`;

  return currentSHA1 === latestSHA1;
}
