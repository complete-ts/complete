/**
 * Helper functions for reading and writing to text files.
 *
 * @module
 */

import fs from "node:fs/promises";

/**
 * Helper function to delete a specific line in a text file.
 *
 * This assumes that the file is a text file and uses an encoding of "utf8".
 *
 * @throws If the line number does not exist in the text file.
 */
export async function deleteLineInFile(
  filePath: string,
  lineNumber: number,
): Promise<void> {
  const fileContents = await readTextFile(filePath);
  const lines = fileContents.split("\n");
  const index = lineNumber - 1;

  if (lines[index] === undefined) {
    throw new Error(
      `Failed to replace line ${lineNumber} in text file "${filePath}" due to that line not existing.`,
    );
  }

  lines.splice(index, 1);
  const newFileContents = lines.join("\n");
  await fs.writeFile(filePath, newFileContents);
}

/** Helper function to synchronously prepend data to a file. */
export async function prependFile(
  filePath: string,
  data: string,
): Promise<void> {
  const fileContents = await readTextFile(filePath);
  const newFileContents = data + fileContents;
  await fs.writeFile(filePath, newFileContents);
}

/**
 * Helper function to asynchronously read a text file.
 *
 * This assumes that the file uses an encoding of "utf8".
 */
export async function readTextFile(filePath: string): Promise<string> {
  return await fs.readFile(filePath, "utf8");
}

/**
 * Helper function to replace a specific line in a text file.
 *
 * This assumes that the file is a text file and uses an encoding of "utf8".
 */
export async function replaceLineInFile(
  filePath: string,
  lineNumber: number,
  newLine: string,
): Promise<void> {
  const fileContents = await readTextFile(filePath);
  const lines = fileContents.split("\n");
  const index = lineNumber - 1;
  const oldLine = lines[index];
  if (oldLine === undefined) {
    throw new Error(
      `Failed to replace line ${lineNumber} in text file "${filePath}" due to that line not existing.`,
    );
  }

  lines[index] = newLine;
  const newFileContents = lines.join("\n");
  await fs.writeFile(filePath, newFileContents);
}

/**
 * Helper function to asynchronously replace text in a file.
 *
 * This assumes that the file is a text file and uses an encoding of "utf8".
 */
export async function replaceTextInFile(
  filePath: string,
  searchValue: string | RegExp,
  replaceValue: string,
): Promise<void> {
  const fileContents = await readTextFile(filePath);
  const newFileContents = fileContents.replaceAll(searchValue, replaceValue);
  await fs.writeFile(filePath, newFileContents);
}
