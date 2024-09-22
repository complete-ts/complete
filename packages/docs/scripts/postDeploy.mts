import { Octokit } from "@octokit/core";
import {
  appendFile,
  echo,
  exit,
  fatalError,
  getArgs,
  isGitRepositoryLatestCommit,
  sleep,
} from "complete-node";
import path from "node:path";

const PACKAGE_ROOT = path.join(import.meta.dirname, "..");
const REPO_ROOT = path.join(PACKAGE_ROOT, "..", "..");
const SECONDS_TO_SLEEP = 10;

// Validate environment variables.
const GITHUB_OUTPUT_FILE = process.env["GITHUB_OUTPUT"];
if (GITHUB_OUTPUT_FILE === undefined || GITHUB_OUTPUT_FILE === "") {
  fatalError("Failed to read the environment variable: GITHUB_OUTPUT");
}

// Validate command-line arguments.
const args = getArgs();

const commitSHA1 = args[0];
if (commitSHA1 === undefined || commitSHA1 === "") {
  fatalError(
    "Error: The SHA1 of the commit is required as the first argument.",
  );
}

const gitHubToken = args[1];
if (gitHubToken === undefined || gitHubToken === "") {
  fatalError("Error: The GitHub token is required as the second argument.");
}

// Wait for the website to be be live (which usually takes around 5 minutes).
// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
while (true) {
  if (!isGitRepositoryLatestCommit(REPO_ROOT)) {
    echo(
      "A more recent commit was found in the repository; skipping website scraping.",
    );
    exit(0);
  }

  /** @see https://github.com/octokit/core.js#readme */
  const octokit = new Octokit({
    auth: gitHubToken,
  });

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
    break;
  }

  echo(
    `The latest version of the site (${commitSHA1}) has not yet been deployed to GitHub Pages. (The GitHub page status is "${status}" and the GitHub page commit is "${commit}".) Sleeping for ${SECONDS_TO_SLEEP} seconds.`,
  );
  await sleep(SECONDS_TO_SLEEP); // eslint-disable-line no-await-in-loop
}

appendFile(GITHUB_OUTPUT_FILE, "SHOULD_SCRAPE=1\n");
