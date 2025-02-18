import chalk from "chalk";
import {
  deleteFileOrDirectory,
  fileOrDirectoryExists,
  isDirectory,
} from "complete-node";
import { CWD } from "../../constants.js";
import { getInputYesNo, promptEnd, promptLog } from "../../prompt.js";

export async function checkIfProjectPathExists(
  projectPath: string,
  yes: boolean,
): Promise<void> {
  if (projectPath === CWD || !fileOrDirectoryExists(projectPath)) {
    return;
  }

  const fileType = isDirectory(projectPath) ? "directory" : "file";

  if (yes) {
    deleteFileOrDirectory(projectPath);
    promptLog(`Deleted ${fileType}: ${chalk.green(projectPath)}`);
    return;
  }

  promptLog(
    `A ${fileType} already exists with a name of: ${chalk.green(projectPath)}`,
  );
  const shouldDelete = await getInputYesNo("Do you want me to delete it?");

  if (!shouldDelete) {
    promptEnd("Ok then. Goodbye.");
  }

  deleteFileOrDirectory(projectPath);
}
