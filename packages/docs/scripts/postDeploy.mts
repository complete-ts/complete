import { Octokit } from "@octokit/core";
import {
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
  echo("Error: The SHA1 of the commit is required as the first argument.");
  exit(1);
}

const gitHubToken = args[1];
if (gitHubToken === undefined || gitHubToken === "") {
  echo("Error: The GitHub token is required as the second argument.");
  exit(1);
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

  console.log(response);
  // eslint-disable-next-line
  if (1 === 1) {
    break;
  }

  echo(
    `The latest version of the site (${commitSHA1}) has not yet been deployed to GitHub Pages. Sleeping for ${SECONDS_TO_SLEEP} seconds.`,
  );
  await sleep(SECONDS_TO_SLEEP); // eslint-disable-line no-await-in-loop
}

/// appendFile(GITHUB_OUTPUT_FILE, "SHOULD_SCRAPE=1\n");
