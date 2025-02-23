import chalk from "chalk";
import { $, commandExists, isFileAsync, readFileAsync } from "complete-node";
import path from "node:path";
import yaml from "yaml";
import { HOME_DIR, PROJECT_NAME, PROJECT_VERSION } from "./constants.js";
import type { GitHubCLIHostsYAML } from "./interfaces/GitHubCLIHostsYAML.js";
import { getInputString, getInputYesNo, promptLog } from "./prompt.js";

/**
 * If the GitHub CLI is installed, we can derive the user's GitHub username from their YAML
 * configuration.
 */
export async function getGitHubUsername(): Promise<string | undefined> {
  const ghExists = await commandExists("gh");
  if (!ghExists) {
    return undefined;
  }

  const githubCLIHostsPath = getGithubCLIHostsPath();
  if (githubCLIHostsPath === undefined) {
    return undefined;
  }

  const hostsPathExists = await isFileAsync(githubCLIHostsPath);
  if (!hostsPathExists) {
    return undefined;
  }

  const configYAMLRaw = await readFileAsync(githubCLIHostsPath);
  const configYAML = yaml.parse(configYAMLRaw) as GitHubCLIHostsYAML;

  const githubCom = configYAML["github.com"];
  if (githubCom === undefined) {
    return undefined;
  }

  const { user } = githubCom;
  if (user === undefined || user === "") {
    return undefined;
  }

  return user;
}

function getGithubCLIHostsPath(): string | undefined {
  if (process.platform === "win32") {
    const appData = process.env["APPDATA"];
    if (appData === undefined || appData === "") {
      return undefined;
    }

    return path.join(appData, "GitHub CLI", "hosts.yml");
  }

  // The location is the same on both macOS and Linux.
  return path.join(HOME_DIR, ".config", "gh", "hosts.yml");
}

/** @returns The git remote URL. For example: git@github.com:alice/foo.git */
export async function promptGitHubRepoOrGitRemoteURL(
  projectName: string,
  yes: boolean,
  skipGit: boolean,
): Promise<string | undefined> {
  if (skipGit) {
    return undefined;
  }

  // Hard-code certain project names as never causing a Git repository to be initialized.
  if (projectName.startsWith("test") || projectName === "foo") {
    return undefined;
  }

  // We do not need to prompt the user if they do not have Git installed.
  const gitExists = await commandExists("git");
  if (!gitExists) {
    promptLog(
      'Git does not seem to be installed. (The "git" command is not in the path.) Skipping Git-related things.',
    );
    return undefined;
  }

  const gitHubUsername = await getGitHubUsername();
  if (gitHubUsername !== undefined) {
    const { exitCode } = await $`gh repo view ${projectName}`;
    const gitHubRepoExists = exitCode === 0;
    const url = `https://github.com/${gitHubUsername}/${projectName}`;

    if (gitHubRepoExists) {
      promptLog(
        `Detected an existing GitHub repository at: ${chalk.green(url)}`,
      );
      const guessedRemoteURL = getGitRemoteURL(projectName, gitHubUsername);

      if (yes) {
        promptLog(
          `Using a Git remote URL of: ${chalk.green(guessedRemoteURL)}`,
        );
        return guessedRemoteURL;
      }

      const shouldUseGuessedURL = await getInputYesNo(
        `Do you want to use a Git remote URL of: ${chalk.green(
          guessedRemoteURL,
        )}`,
      );
      if (shouldUseGuessedURL) {
        return guessedRemoteURL;
      }

      // Assume that since they do not want to connect this project to the existing GitHub
      // repository, they do not want to initialize a remote Git URL at all.
      return undefined;
    }

    if (yes) {
      await $`gh repo create ${projectName} --public`;
      promptLog(`Created a new GitHub repository at: ${chalk.green(url)}`);
      return getGitRemoteURL(projectName, gitHubUsername);
    }

    const createNewGitHubRepo = await getInputYesNo(
      `Would you like to create a new GitHub repository at: ${chalk.green(
        url,
      )}`,
    );
    if (createNewGitHubRepo) {
      await $`gh repo create ${projectName} --public`;
      promptLog("Successfully created a new GitHub repository.");
      return getGitRemoteURL(projectName, gitHubUsername);
    }

    // Assume that since they do not want to create a new GitHub repository, they do not want to
    // initialize a remote Git URL at all.
    return undefined;
  }

  const gitRemoteURL =
    await getInputString(`Paste in the remote Git URL for your project.
For example, if you have an SSH key, it would be something like:
${chalk.green("git@github.com:Alice/green-candle.git")}
If you don't have an SSH key, it would be something like:
${chalk.green("https://github.com/Alice/green-candle.git")}
If you don't want to initialize a Git repository for this project, press enter to skip.
`);

  return gitRemoteURL === "" ? undefined : gitRemoteURL;
}

function getGitRemoteURL(projectName: string, gitHubUsername: string) {
  return `git@github.com:${gitHubUsername}/${projectName}.git`;
}

export async function initGitRepository(
  projectPath: string,
  gitRemoteURL: string | undefined,
): Promise<void> {
  const gitExists = await commandExists("git");
  if (!gitExists) {
    return;
  }

  if (gitRemoteURL === undefined) {
    return;
  }

  const $$ = $({ cwd: projectPath });

  await $$`git init --initial-branch main`;
  await $$`git remote add origin ${gitRemoteURL}`;

  const gitNameAndEmailConfigured = await isGitNameAndEmailConfigured();
  if (gitNameAndEmailConfigured) {
    await $$`git add --all`;
    const commitMessage = `chore: add files from ${PROJECT_NAME} ${PROJECT_VERSION} template`;
    await $$`git commit --message ${commitMessage}`;
    await $$`git push --set-upstream origin main`;
  }
}

async function isGitNameAndEmailConfigured(): Promise<boolean> {
  const { exitCode: nameExitCode } = await $`git config --global user.name`;
  const { exitCode: emailExitCode } = await $`git config --global user.email`;

  return nameExitCode === 0 && emailExitCode === 0;
}
