import { Octokit } from "@octokit/core";
import {
  $,
  appendFile,
  cp,
  echo,
  exit,
  fatalError,
  getArgs,
  isGitRepositoryClean,
  isGitRepositoryLatestCommit,
  mv,
  rm,
  sleep,
} from "complete-node";
import path from "node:path";

const DOCS_REPO_NAME = "complete-ts.github.io";
const PACKAGE_ROOT = path.join(import.meta.dirname, "..");
const BUILD_DIRECTORY_PATH = path.join(PACKAGE_ROOT, "build");
const REPO_ROOT = path.join(PACKAGE_ROOT, "..", "..");
const DOCS_REPO = path.join(REPO_ROOT, DOCS_REPO_NAME);
const DOCS_REPO_GIT = path.join(DOCS_REPO, ".git");
const DOCS_REPO_GIT_BACKUP = `/tmp/${DOCS_REPO_NAME}.git`;
const SECONDS_TO_SLEEP = 10;

// Validate environment variables.
const GITHUB_OUTPUT_FILE = process.env["GITHUB_OUTPUT"];
if (GITHUB_OUTPUT_FILE === undefined || GITHUB_OUTPUT_FILE === "") {
  fatalError("Failed to read the environment variable: GITHUB_OUTPUT");
}

// Validate command-line arguments.
const args = getArgs();

const gitHubToken = args[0];
if (gitHubToken === undefined || gitHubToken === "") {
  fatalError("Error: The GitHub token is required as the first argument.");
}

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

const $$ = $({ cwd: DOCS_REPO });
$$.sync`git config --global user.email "github-actions@users.noreply.github.com"`;
$$.sync`git config --global user.name "github-actions"`;
// We overwrite the previous commit instead of adding a new one in order to keep the size of the
// repository as small as possible. This speeds up deployment because with thousands of commits, it
// takes a very long time to clone.
$$.sync`git add --all`;
$$.sync`git commit --message deploy --amend`;
$$.sync`git push --force-with-lease`;

const commitSHA1 = $$.sync`git rev-parse HEAD`.stdout;
if (commitSHA1 === "") {
  fatalError("Failed to parse the deployed website commit SHA1.");
}

/** @see https://github.com/octokit/core.js */
const octokit = new Octokit({
  auth: gitHubToken,
});

// Wait for the website to be be live (which usually takes around 5 minutes).
let totalSeconds = 0;
// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
while (true) {
  if (!isGitRepositoryLatestCommit(REPO_ROOT)) {
    echo(
      "A more recent commit was found in the repository; skipping website scraping.",
    );
    exit(0);
  }

  /**
   * @see https://docs.github.com/en/rest/pages/pages?apiVersion=2022-11-28#get-latest-pages-build
   */
  // eslint-disable-next-line no-await-in-loop, complete/no-object-any
  const response = await octokit.request(
    "GET /repos/complete-ts/complete-ts.github.io/pages/builds/latest",
    {
      owner: "complete-ts",
      repo: "complete-ts.github.io",
      headers: {
        "X-GitHub-Api-Version": "2022-11-28",
      },
    },
  );

  const data = response.data as Record<string, unknown>;
  const { status, commit } = data;

  if (typeof status !== "string") {
    fatalError("Failed to parse the status from the GitHub API response.");
  }

  if (typeof commit !== "string") {
    fatalError("Failed to parse the commit from the GitHub API response.");
  }

  if (status === "built" && commit === commitSHA1) {
    echo(
      `The latest version of the site is now deployed. (It took ${totalSeconds} seconds.)`,
    );
    break;
  }

  echo(
    `The latest version of the site (${commitSHA1}) has not yet been deployed to GitHub Pages. (The GitHub page status is "${status}" and the GitHub page commit is "${commit}".) Sleeping for ${SECONDS_TO_SLEEP} seconds. (${totalSeconds} seconds have passed so far in total.)`,
  );
  await sleep(SECONDS_TO_SLEEP); // eslint-disable-line no-await-in-loop
  totalSeconds += SECONDS_TO_SLEEP;
}

appendFile(GITHUB_OUTPUT_FILE, "SHOULD_CRAWL=1\n");
