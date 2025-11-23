import chalk from "chalk";
import {
  deleteFileOrDirectory,
  exists,
  isDirectory,
  isFile,
} from "complete-node";
import { CWD } from "../../constants.js";
import { getInputYesNo, promptEnd, promptLog } from "../../prompt.js";

/** @rejects If the project path exists and is not a file or a directory. */
export async function checkIfProjectPathExists(
  projectPath: string,
  yes: boolean,
): Promise<void> {
  if (projectPath === CWD) {
    return;
  }

  const projectPathExists = await exists(projectPath);
  if (!projectPathExists) {
    return;
  }

  const file = await isFile(projectPath);
  const directory = await isDirectory(projectPath);
  if (!file && !directory) {
    throw new Error(
      `Failed to detect if the path was a file or a directory: ${projectPath}`,
    );
  }
  const fileType = file ? "file" : "directory";

  if (yes) {
    await deleteFileOrDirectory(projectPath);
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

  await deleteFileOrDirectory(projectPath);
}
