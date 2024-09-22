import {
  $op,
  cp,
  echo,
  exit,
  isGitRepositoryClean,
  isGitRepositoryLatestCommit,
  mv,
  rm,
} from "complete-node";
import path from "node:path";

const DOCS_REPO_NAME = "complete-ts.github.io";
const PACKAGE_ROOT = path.join(import.meta.dirname, "..");
const BUILD_DIRECTORY_PATH = path.join(PACKAGE_ROOT, "build");
const REPO_ROOT = path.join(PACKAGE_ROOT, "..", "..");
const DOCS_REPO = path.join(REPO_ROOT, DOCS_REPO_NAME);
const DOCS_REPO_GIT = path.join(DOCS_REPO, ".git");
const DOCS_REPO_GIT_BACKUP = `/tmp/${DOCS_REPO_NAME}.git`;

// The website repository will be already cloned at this point by the previous GitHub action,
// including switching to the "gh-pages" branch. See "ci.yml" for more information.
mv(DOCS_REPO_GIT, DOCS_REPO_GIT_BACKUP);
rm(DOCS_REPO);
cp(BUILD_DIRECTORY_PATH, DOCS_REPO);
mv(DOCS_REPO_GIT_BACKUP, DOCS_REPO_GIT);

if (isGitRepositoryClean(DOCS_REPO)) {
  echo("There are no documentation website changes to deploy.");
  exit();
}

// Ensure that the checked out version of this repository is the latest version. (It is possible
// that another commit has been pushed in the meantime, in which case we should do nothing and wait
// for the CI on that commit to finish.)
// https://stackoverflow.com/questions/3258243/check-if-pull-needed-in-git
if (!isGitRepositoryLatestCommit(REPO_ROOT)) {
  echo(
    "A more recent commit was found in the repository; skipping website deployment.",
  );
  exit();
}

echo(`Deploying changes to the documentation website: ${DOCS_REPO_NAME}`);
const $$ = $op({ cwd: DOCS_REPO });
$$.sync`git config --global user.email "github-actions@users.noreply.github.com"`;
$$.sync`git config --global user.name "github-actions"`;
// We overwrite the previous commit instead of adding a new one in order to keep the size of the
// repository as small as possible. This speeds up deployment because with thousands of commits, it
// takes a very long time to clone.
$$.sync`git add --all`;
$$.sync`git commit --message deploy --amend`;
$$.sync`git push --force-with-lease`;
