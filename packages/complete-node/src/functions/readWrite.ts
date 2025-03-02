/**
 * Helper functions for reading and writing to text files.
 *
 * @module
 */

import fs from "node:fs";
import fsPromises from "node:fs/promises";

/**
 * Helper function to synchronously append data to a file. If the file does not exist, it will be
 * automatically created.
 *
 * This will throw an error if the file cannot be appended to.
 */
export function appendFile(filePath: string, data: string): void {
  try {
    fs.appendFileSync(filePath, data);
  } catch (error) {
    throw new Error(`Failed to append to the "${filePath}" file: ${error}`);
  }
}

/**
 * Helper function to asynchronously append data to a file. If the file does not exist, it will be
 * automatically created.
 *
 * This will throw an error if the file cannot be appended to.
 */
export async function appendFileAsync(
  filePath: string,
  data: string,
): Promise<void> {
  try {
    await fsPromises.appendFile(filePath, data);
  } catch (error) {
    throw new Error(`Failed to append to the "${filePath}" file: ${error}`);
  }
}

/**
 * Helper function to delete a specific line in a text file.
 *
 * This assumes that the file is a text file and uses an encoding of "utf8".
 *
 * This will print an error message and exit the program if the file cannot be read.
 */
export function deleteLineInFile(filePath: string, lineNumber: number): void {
  const fileContents = readFile(filePath);
  const lines = fileContents.split("\n");
  const index = lineNumber - 1;

  if (lines[index] === undefined) {
    throw new Error(
      `Failed to replace line ${lineNumber} in text file "${filePath}" due to that line not existing.`,
    );
  }

  lines.splice(index, 1);
  const newFileContents = lines.join("\n");
  writeFile(filePath, newFileContents);
}

/**
 * Helper function to synchronously prepend data to a file.
 *
 * This will throw an error if the file cannot be prepended to.
 */
export function prependFile(filePath: string, data: string): void {
  const fileContents = readFile(filePath);
  const newFileContents = data + fileContents;
  writeFile(filePath, newFileContents);
}

/**
 * Helper function to synchronously read a file.
 *
 * This assumes that the file is a text file and uses an encoding of "utf8".
 *
 * This will throw an error if the file cannot be read.
 */
export function readFile(filePath: string): string {
  let fileContents: string;

  try {
    fileContents = fs.readFileSync(filePath, "utf8");
  } catch (error) {
    throw new Error(`Failed to read text file "${filePath}": ${error}`);
  }

  return fileContents;
}

/**
 * Helper function to asynchronously read a file.
 *
 * This assumes that the file is a text file and uses an encoding of "utf8".
 *
 * This will throw an error if the file cannot be read.
 */
export async function readFileAsync(filePath: string): Promise<string> {
  let fileContents: string;

  try {
    fileContents = await fsPromises.readFile(filePath, "utf8");
  } catch (error) {
    throw new Error(`Failed to read text file "${filePath}": ${error}`);
  }

  return fileContents;
}

/**
 * Helper function to replace a specific line in a text file.
 *
 * This assumes that the file is a text file and uses an encoding of "utf8".
 *
 * This will print an error message and exit the program if the file cannot be read.
 */
export function replaceLineInFile(
  filePath: string,
  lineNumber: number,
  newLine: string,
): void {
  const fileContents = readFile(filePath);
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
  writeFile(filePath, newFileContents);
}

/**
 * Helper function to synchronously replace text in a file.
 *
 * This assumes that the file is a text file and uses an encoding of "utf8".
 *
 * This will print an error message and exit the program if the file cannot be read.
 */
export function replaceTextInFile(
  filePath: string,
  searchValue: string | RegExp,
  replaceValue: string,
): void {
  const fileContents = readFile(filePath);
  const newFileContents = fileContents.replaceAll(searchValue, replaceValue);
  writeFile(filePath, newFileContents);
}

/**
 * Helper function to synchronously write data to a file.
 *
 * This will throw an error if the file cannot be written to.
 */
export function writeFile(filePath: string, data: string): void {
  try {
    fs.writeFileSync(filePath, data);
  } catch (error) {
    throw new Error(`Failed to write to the "${filePath}" file: ${error}`);
  }
}

/**
 * Helper function to asynchronously write data to a file.
 *
 * This will throw an error if the file cannot be written to.
 */
export async function writeFileAsync(
  filePath: string,
  data: string,
): Promise<void> {
  try {
    await fsPromises.writeFile(filePath, data);
  } catch (error) {
    throw new Error(`Failed to write to the "${filePath}" file: ${error}`);
  }
}
