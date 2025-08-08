import { Octokit } from "@octokit/core";
import {
  $q,
  appendFile,
  copyFileOrDirectory,
  deleteFileOrDirectory,
  fatalError,
  getArgs,
  isGitRepositoryClean,
  isGitRepositoryLatestCommit,
  moveFileOrDirectory,
  sleep,
} from "complete-node";
import path from "node:path";

const DOCS_REPO_NAME = "complete-ts.github.io";
const PACKAGE_ROOT = path.resolve(import.meta.dirname, "..");
const BUILD_DIRECTORY_PATH = path.join(PACKAGE_ROOT, "build");
const REPO_ROOT = path.resolve(PACKAGE_ROOT, "..", "..");
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
await moveFileOrDirectory(DOCS_REPO_GIT, DOCS_REPO_GIT_BACKUP);
await deleteFileOrDirectory(DOCS_REPO);
await copyFileOrDirectory(BUILD_DIRECTORY_PATH, DOCS_REPO);
await moveFileOrDirectory(DOCS_REPO_GIT_BACKUP, DOCS_REPO_GIT);

const isRepositoryClean = await isGitRepositoryClean(DOCS_REPO);
if (isRepositoryClean) {
  console.log("There are no documentation website changes to deploy.");
  process.exit();
}

// Ensure that the checked out version of this repository is the latest version. (It is possible
// that another commit has been pushed in the meantime, in which case we should do nothing and wait
// for the CI on that commit to finish.)
// https://stackoverflow.com/questions/3258243/check-if-pull-needed-in-git
const isLatestCommitAtStart = await isGitRepositoryLatestCommit(REPO_ROOT);
if (!isLatestCommitAtStart) {
  console.log(
    "A more recent commit was found in the repository; skipping website deployment.",
  );
  process.exit();
}

console.log(
  `Deploying changes to the documentation website: ${DOCS_REPO_NAME}`,
);

const $$q = $q({ cwd: DOCS_REPO });
await $$q`git config --global user.email "github-actions@users.noreply.github.com"`;
await $$q`git config --global user.name "github-actions"`;
// We overwrite the previous commit instead of adding a new one in order to keep the size of the
// repository as small as possible. This speeds up deployment because with thousands of commits, it
// takes a very long time to clone.
await $$q`git add --all`;
await $$q`git commit --message deploy --amend`;
await $$q`git push --force-with-lease`;

const { stdout: commitSHA1 } = await $$q`git rev-parse HEAD`;
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
  // eslint-disable-next-line no-await-in-loop
  const isLatestCommit = await isGitRepositoryLatestCommit(REPO_ROOT);
  if (!isLatestCommit) {
    console.log(
      "A more recent commit was found in the repository; skipping website scraping.",
    );
    process.exit();
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
    console.log(
      `The latest version of the site is now deployed. (It took ${totalSeconds} seconds.)`,
    );
    break;
  }

  console.log(
    `The latest version of the site (${commitSHA1}) has not yet been deployed to GitHub Pages. (The GitHub page status is "${status}" and the GitHub page commit is "${commit}".) Sleeping for ${SECONDS_TO_SLEEP} seconds. (${totalSeconds} seconds have passed so far in total.)`,
  );
  await sleep(SECONDS_TO_SLEEP); // eslint-disable-line no-await-in-loop
  totalSeconds += SECONDS_TO_SLEEP;
}

await appendFile(GITHUB_OUTPUT_FILE, "SHOULD_CRAWL=1\n");
