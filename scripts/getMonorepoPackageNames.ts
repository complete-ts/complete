import {
  appendFile,
  echo,
  fatalError,
  getArgs,
  getMonorepoPackageNames,
} from "complete-node";

const GITHUB_ACTIONS_OUTPUT_VARIABLE_NAME = "matrix";

// Validate environment variables.
const gitHubOutputFile = process.env["GITHUB_OUTPUT"];
if (gitHubOutputFile === undefined || gitHubOutputFile === "") {
  fatalError("Failed to read the environment variable: GITHUB_OUTPUT");
}

const args = getArgs();
const scriptName = args[0];
const packageNames = getMonorepoPackageNames(scriptName);
const packageNamesString = JSON.stringify(packageNames);

echo(packageNamesString);

// Quoting `packageNamesString` is unnecessary and will cause downstream errors.
const gitHubActionsOutput = `${GITHUB_ACTIONS_OUTPUT_VARIABLE_NAME}=${packageNamesString}\n`;
appendFile(gitHubOutputFile, gitHubActionsOutput);
