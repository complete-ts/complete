/**
 * Helper functions for reading and writing to text files.
 *
 * @module
 */

import fs from "node:fs/promises";

/**
 * Helper function to asynchronously append data to a file. If the file does not exist, it will be
 * automatically created.
 *
 * @rejects If the file cannot be appended to.
 */
export async function appendFile(
  filePath: string,
  data: string,
): Promise<void> {
  try {
    await fs.appendFile(filePath, data);
  } catch (error) {
    throw new Error(`Failed to append to the file: ${filePath}`, {
      cause: error,
    });
  }
}

/**
 * Helper function to delete a specific line in a text file.
 *
 * This assumes that the file is a text file and uses an encoding of "utf8".
 *
 * @rejects If the line number does not exist in the text file or the file cannot be written to.
 */
export async function deleteLineInFile(
  filePath: string,
  lineNumber: number,
): Promise<void> {
  const fileContents = await readFile(filePath);
  const lines = fileContents.split("\n");
  const index = lineNumber - 1;

  if (lines[index] === undefined) {
    throw new Error(
      `Failed to replace line ${lineNumber} in text file "${filePath}" due to that line not existing.`,
    );
  }

  lines.splice(index, 1);
  const newFileContents = lines.join("\n");
  await writeFile(filePath, newFileContents);
}

/**
 * Helper function to synchronously prepend data to a file.
 *
 * @rejects If the file cannot be written to.
 */
export async function prependFile(
  filePath: string,
  data: string,
): Promise<void> {
  const fileContents = await readFile(filePath);
  const newFileContents = data + fileContents;
  await writeFile(filePath, newFileContents);
}

/**
 * Helper function to asynchronously read a file.
 *
 * This assumes that the file is a text file and uses an encoding of "utf8".
 *
 * @rejects If the file cannot be read.
 */
export async function readFile(filePath: string): Promise<string> {
  try {
    return await fs.readFile(filePath, "utf8");
  } catch (error) {
    throw new Error(`Failed to read file: ${filePath}`, {
      cause: error,
    });
  }
}

/**
 * Helper function to replace a specific line in a text file.
 *
 * This assumes that the file is a text file and uses an encoding of "utf8".
 *
 * @rejects If the line number does not exist in the text file or the file cannot be written to.
 */
export async function replaceLineInFile(
  filePath: string,
  lineNumber: number,
  newLine: string,
): Promise<void> {
  const fileContents = await readFile(filePath);
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
  await writeFile(filePath, newFileContents);
}

/**
 * Helper function to asynchronously replace text in a file.
 *
 * This assumes that the file is a text file and uses an encoding of "utf8".
 *
 * @rejects If the file cannot be written to.
 */
export async function replaceTextInFile(
  filePath: string,
  searchValue: string | RegExp,
  replaceValue: string,
): Promise<void> {
  const fileContents = await readFile(filePath);
  const newFileContents = fileContents.replaceAll(searchValue, replaceValue);
  await writeFile(filePath, newFileContents);
}

/**
 * Helper function to asynchronously write data to a file.
 *
 * @rejects If the file cannot be written to.
 */
export async function writeFile(filePath: string, data: string): Promise<void> {
  try {
    await fs.writeFile(filePath, data);
  } catch (error) {
    throw new Error(`Failed to write to the file: ${filePath}`, {
      cause: error,
    });
  }
}
