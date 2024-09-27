import { $op } from "./execa.js";

/** Helper function to determine whether the given path is inside of a Git repository. */
export function isGitRepository(gitRepositoryDirectoryPath: string): boolean {
  const $$ = $op({ cwd: gitRepositoryDirectoryPath });
  const returnBase = $$.sync`git rev-parse --is-inside-work-tree`;
  return returnBase.exitCode === 0;
}

/**
 * Helper function to determine whether the given Git repository is "clean", meaning has no
 * unchanged files from the head.
 */
export function isGitRepositoryClean(
  gitRepositoryDirectoryPath: string,
): boolean {
  const $$ = $op({ cwd: gitRepositoryDirectoryPath });
  const gitStatus = $$.sync`git status --porcelain`.stdout;
  return gitStatus === "";
}

/** Helper function to determine whether the given Git repository is up to date with the remote. */
export function isGitRepositoryLatestCommit(
  gitRepositoryDirectoryPath: string,
): boolean {
  const $$ = $op({ cwd: gitRepositoryDirectoryPath });
  $$.sync`git fetch`;

  const currentSHA1 = $$.sync`git rev-parse HEAD`.stdout;
  const latestSHA1 = $$.sync`git rev-parse @{u}`.stdout;

  return currentSHA1 === latestSHA1;
}
