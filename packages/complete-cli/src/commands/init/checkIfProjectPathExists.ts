import chalk from "chalk";
import { deleteFileOrDirectory, isDirectory, isFile } from "complete-node";
import { CWD } from "../../constants.js";
import { getInputYesNo, promptEnd, promptLog } from "../../prompt.js";

/** @throws If the project path is not a file or a directory. */
export async function checkIfProjectPathExists(
  projectPath: string,
  yes: boolean,
): Promise<void> {
  if (projectPath === CWD) {
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
