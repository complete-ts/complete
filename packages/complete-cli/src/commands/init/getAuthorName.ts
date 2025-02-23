import { getGitHubUsername } from "../../git.js";
import { getInputString, promptError, promptLog } from "../../prompt.js";

export async function getAuthorName(): Promise<string | undefined> {
  const gitHubUsername = await getGitHubUsername();
  if (gitHubUsername !== undefined) {
    return gitHubUsername;
  }

  return await getNewAuthorName();
}

async function getNewAuthorName(): Promise<string> {
  promptLog(
    "The author name was not found from the GitHub CLI configuration file.",
  );
  const authorName = await getInputString("Enter the author of the project:");
  if (authorName === "") {
    promptError("You must enter an author name.");
  }

  return authorName;
}
