/**
 * Helper functions for file operations.
 *
 * @module
 */

import { trimSuffix } from "complete-common";
import type { Dirent } from "node:fs";
import fs from "node:fs";
import fsPromises from "node:fs/promises";
import path from "node:path";
import { writeFile, writeFileAsync } from "./readWrite.js";

/**
 * Helper function to synchronously copy a file or directory. If a path to a directory is specified,
 * the directory will be recursively copied.
 *
 * This will throw an error if the file cannot be copied.
 */
export function copyFileOrDirectory(srcPath: string, dstPath: string): void {
  try {
    fs.cpSync(srcPath, dstPath, {
      recursive: true,
    });
  } catch (error) {
    throw new Error(
      `Failed to copy file or directory "${srcPath}" to "${dstPath}": ${error}`,
    );
  }
}

/**
 * Helper function to asynchronously copy a file or directory. If a path to a directory is
 * specified, the directory will be recursively copied.
 *
 * This will throw an error if the file cannot be copied.
 */
export async function copyFileOrDirectoryAsync(
  srcPath: string,
  dstPath: string,
): Promise<void> {
  try {
    await fs.promises.cp(srcPath, dstPath, {
      recursive: true,
    });
  } catch (error) {
    throw new Error(
      `Failed to copy file or directory "${srcPath}" to "${dstPath}": ${error}`,
    );
  }
}

/** Alias for the `copyFileOrDirectory` function. Intended to be used in scripts. */
export function cp(srcPath: string, dstPath: string): void {
  copyFileOrDirectory(srcPath, dstPath);
}

/**
 * Helper function to synchronously delete a file or directory. If a path to a directory is
 * specified, the directory will be recursively deleted. If the path does not exist, this function
 * will be a no-op.
 *
 * This will throw an error if the file cannot be deleted.
 *
 * This function is variadic, meaning that you can pass as many file paths as you want to delete.
 */
export function deleteFileOrDirectory(...filePaths: readonly string[]): void {
  for (const filePath of filePaths) {
    try {
      if (fs.existsSync(filePath)) {
        fs.rmSync(filePath, {
          recursive: true,
        });
      }
    } catch (error) {
      throw new Error(
        `Failed to delete file or directory "${filePath}": ${error}`,
      );
    }
  }
}

/**
 * Helper function to asynchronously delete a file or directory. If a path to a directory is
 * specified, the directory will be recursively deleted. If the path does not exist, this function
 * will be a no-op.
 *
 * This will throw an error if the file cannot be deleted.
 *
 * This function is variadic, meaning that you can pass as many file paths as you want to delete.
 */
export async function deleteFileOrDirectoryAsync(
  ...filePaths: readonly string[]
): Promise<void> {
  await Promise.all(
    filePaths.map(async (filePath) => {
      // Deleting files that do not exist will throw an error, so we need to explicitly check for
      // that.
      try {
        await fsPromises.rm(filePath, {
          recursive: true,
        });
      } catch (error) {
        // Deleting files that do not exit should be a no-op. ("ENOENT" means "Error NO ENTry".)
        if ((error as NodeJS.ErrnoException).code !== "ENOENT") {
          throw error;
        }
      }
    }),
  );
}

/**
 * Helper function to synchronously check if a file exists.
 *
 * This will throw an error if there is an error when checking the file path.
 */
export function fileOrDirectoryExists(filePath: string): boolean {
  let exists: boolean;

  try {
    exists = fs.existsSync(filePath);
  } catch (error) {
    throw new Error(
      `Failed to check if file or directory "${filePath}" exists: ${error}`,
    );
  }

  return exists;
}

/**
 * Helper function to synchronously get the file names inside of a directory. (If the full path is
 * required, use the `getFilePathsInDirectory` helper function instead.)
 *
 * This will throw an error if there is an error when checking the directory.
 *
 * @param directoryPath The path to the directory.
 * @param filter Optional. If specified, will only return this type of file.
 */
export function getFileNamesInDirectory(
  directoryPath: string,
  filter?: "files" | "directories",
): readonly string[] {
  let fileEntries: Dirent[];
  try {
    fileEntries = fs.readdirSync(directoryPath, {
      withFileTypes: true,
    });
  } catch (error) {
    throw new Error(
      `Failed to get the file names in the "${directoryPath}" directory: ${error}`,
    );
  }

  return getDirectoryEntryFileNames(fileEntries, filter);
}

/**
 * Helper function to asynchronously get the file names inside of a directory. (If the full path is
 * required, you must manually join the file name with the path to the directory.)
 *
 * This will throw an error if there is an error when checking the directory.
 *
 * @param directoryPath The path to the directory.
 * @param filter Optional. If specified, will only return this type of file.
 */
export async function getFileNamesInDirectoryAsync(
  directoryPath: string,
  filter?: "files" | "directories",
): Promise<readonly string[]> {
  let fileEntries: Dirent[];
  try {
    fileEntries = await fsPromises.readdir(directoryPath, {
      withFileTypes: true,
    });
  } catch (error) {
    throw new Error(
      `Failed to get the file names in the "${directoryPath}" directory: ${error}`,
    );
  }

  return getDirectoryEntryFileNames(fileEntries, filter);
}

function getDirectoryEntryFileNames(
  fileEntries: readonly Dirent[],
  filter?: "files" | "directories",
): readonly string[] {
  let filteredFileEntries: readonly Dirent[];

  switch (filter) {
    case undefined: {
      filteredFileEntries = fileEntries;
      break;
    }

    case "files": {
      filteredFileEntries = fileEntries.filter((fileEntry) =>
        fileEntry.isFile(),
      );
      break;
    }

    case "directories": {
      filteredFileEntries = fileEntries.filter((fileEntry) =>
        fileEntry.isDirectory(),
      );
      break;
    }
  }

  return filteredFileEntries.map((file) => file.name);
}

/**
 * Helper function to synchronously get the path to file, given either a file path, a directory
 * path, or `undefined`.
 *
 * This will throw an error if the file cannot be found.
 *
 * @param fileName The name of the file to find.
 * @param filePathOrDirPath Either the path to a file or the path to a directory which contains the
 *                          file. If undefined is passed, the current working directory will be
 *                          used.
 */
export async function getFilePath(
  fileName: string,
  filePathOrDirPath: string | undefined,
): Promise<string> {
  filePathOrDirPath ??= process.cwd(); // eslint-disable-line no-param-reassign

  const file = await isFileAsync(filePathOrDirPath);
  if (file) {
    return filePathOrDirPath;
  }

  const directory = await isDirectoryAsync(filePathOrDirPath);
  if (directory) {
    const filePath = path.join(filePathOrDirPath, fileName);
    const fileInDirectory = await isFileAsync(filePath);
    if (fileInDirectory) {
      return filePath;
    }

    throw new Error(
      `Failed to find a "${fileName}" file at the following directory: ${filePathOrDirPath}`,
    );
  }

  throw new Error(
    `Failed to find a "${fileName}" file at the following path: ${filePathOrDirPath}`,
  );
}

/**
 * Helper function to synchronously get the file paths inside of a directory.
 *
 * This will throw an error if there is an error when checking the directory.
 *
 * @param directoryPath The path to the directory.
 * @param filter Optional. If specified, will only return this type of file.
 */
export function getFilePathsInDirectory(
  directoryPath: string,
  filter?: "files" | "directories",
): readonly string[] {
  const fileNames = getFileNamesInDirectory(directoryPath, filter);
  return fileNames.map((fileName) => path.join(directoryPath, fileName));
}

/**
 * Helper function to asynchronously get the file paths inside of a directory.
 *
 * This will throw an error if there is an error when checking the directory.
 *
 * @param directoryPath The path to the directory.
 *
 * @param filter Optional. If specified, will only return this type of file.
 */
export async function getFilePathsInDirectoryAsync(
  directoryPath: string,
  filter?: "files" | "directories",
): Promise<readonly string[]> {
  const fileNames = await getFileNamesInDirectoryAsync(directoryPath, filter);
  return fileNames.map((fileName) => path.join(directoryPath, fileName));
}

/**
 * Helper function to recursively traverse a directory and get the file names that match the
 * provided logic.
 *
 * @param directoryPath The path to the directory to crawl.
 * @param matchFunc The function that contains the matching logic.
 */
export async function getMatchingFilePaths(
  directoryPath: string,
  matchFunc: (filePath: string) => boolean,
): Promise<readonly string[]> {
  const files = await fs.promises.readdir(directoryPath, {
    withFileTypes: true,
  });

  const promises: Array<Promise<readonly string[]>> = [];
  const filePaths: string[] = [];

  for (const file of files) {
    const filePath = path.join(directoryPath, file.name);

    if (file.isDirectory()) {
      const promise = getMatchingFilePaths(filePath, matchFunc);
      promises.push(promise);
    } else {
      const match = matchFunc(filePath);
      if (match) {
        filePaths.push(filePath);
      }
    }
  }

  const filePathsInSubdirectories = await Promise.all(promises);

  return [...filePaths, ...filePathsInSubdirectories.flat()];
}

/** Helper function to synchronously check if the provided path exists and is a directory. */
export function isDirectory(filePath: string): boolean {
  try {
    return fs.existsSync(filePath) && fs.statSync(filePath).isDirectory();
  } catch {
    return false;
  }
}

/** Helper function to asynchronously check if the provided path exists and is a directory. */
export async function isDirectoryAsync(filePath: string): Promise<boolean> {
  try {
    const stats = await fsPromises.stat(filePath);
    return stats.isDirectory();
  } catch {
    return false;
  }
}

/** Helper function to synchronously check if the provided path exists and is a file. */
export function isFile(filePath: string): boolean {
  try {
    return fs.existsSync(filePath) && fs.statSync(filePath).isFile();
  } catch {
    return false;
  }
}

/** Helper function to asynchronously check if the provided path exists and is a file. */
export async function isFileAsync(filePath: string): Promise<boolean> {
  try {
    const stats = await fsPromises.stat(filePath);
    return stats.isFile();
  } catch {
    return false;
  }
}

/** Helper function to synchronously check if the provided path exists and is a symbolic link. */
export function isLink(filePath: string): boolean {
  try {
    return fs.existsSync(filePath) && fs.lstatSync(filePath).isSymbolicLink();
  } catch {
    return false;
  }
}

/** Helper function to see if a directory is a subdirectory of another one. */
export function isSubdirectoryOf(
  directoryPath: string,
  parentPath: string,
): boolean {
  const relative = path.relative(parentPath, directoryPath);
  return (
    relative !== "" && !relative.startsWith("..") && !path.isAbsolute(relative)
  );
}

/**
 * Helper function to synchronously make a new directory. Will recursively make as many
 * subdirectories as needed.
 *
 * If the recursive behavior is not desired, then use `fs.mkdirSync` directly.
 *
 * This will throw an error if the directory cannot be created.
 */
export function makeDirectory(directoryPath: string): void {
  try {
    fs.mkdirSync(directoryPath, {
      recursive: true,
    });
  } catch (error) {
    throw new Error(
      `Failed to delete file or directory "${directoryPath}": ${error}`,
    );
  }
}

/**
 * Helper function to asynchronously make a new directory. Will recursively make as many
 * subdirectories as needed.
 *
 * If the recursive behavior is not desired, then use `fs.mkdir` directly.
 *
 * This will throw an error if the directory cannot be created.
 */
export async function makeDirectoryAsync(directoryPath: string): Promise<void> {
  try {
    await fs.promises.mkdir(directoryPath, {
      recursive: true,
    });
  } catch (error) {
    throw new Error(
      `Failed to delete file or directory "${directoryPath}": ${error}`,
    );
  }
}

/** Alias for the `makeDirectory` function. Intended to be used in scripts. */
export function mkdir(directoryPath: string): void {
  makeDirectory(directoryPath);
}

/** Helper function to move all files from one directory to another one. */
export function moveAllFilesInDirectory(
  srcDirectory: string,
  dstDirectory: string,
): void {
  const filePaths = getFilePathsInDirectory(srcDirectory);
  for (const filePath of filePaths) {
    const fileName = path.basename(filePath);
    const dstPath = path.join(dstDirectory, fileName);
    moveFile(filePath, dstPath);
  }
}

/**
 * Helper function to synchronously move a file.
 *
 * This will throw an error if the file cannot be moved.
 *
 * (This is simply an alias for the `renameFile` function, since the Node.js API uses the same thing
 * for both operations.)
 */
export function moveFile(srcPath: string, dstPath: string): void {
  renameFile(srcPath, dstPath);
}

/**
 * Helper function to asynchronously move a file.
 *
 * This will throw an error if the file cannot be moved.
 *
 * (This is simply an alias for the `renameFileAsync` function, since the Node.js API uses the same
 * thing for both operations.)
 */
export async function moveFileAsync(
  srcPath: string,
  dstPath: string,
): Promise<void> {
  await renameFileAsync(srcPath, dstPath);
}

/** Alias for the `moveFile` function. Intended to be used in scripts. */
export function mv(srcPath: string, dstPath: string): void {
  moveFile(srcPath, dstPath);
}

/**
 * Helper function to synchronously rename a file.
 *
 * This will throw an error if the file cannot be renamed.
 */
export function renameFile(srcPath: string, dstPath: string): void {
  try {
    fs.renameSync(srcPath, dstPath);
  } catch (error) {
    throw new Error(`Failed to rename "${srcPath}" to "${dstPath}": ${error}`);
  }
}

/**
 * Helper function to asynchronously rename a file.
 *
 * This will throw an error if the file cannot be renamed.
 */
export async function renameFileAsync(
  srcPath: string,
  dstPath: string,
): Promise<void> {
  try {
    await fs.promises.rename(srcPath, dstPath);
  } catch (error) {
    throw new Error(`Failed to rename "${srcPath}" to "${dstPath}": ${error}`);
  }
}

/**
 * Helper function to recursively rename all of the files in a directory from one file extension to
 * another.
 *
 * @param directoryPath The path to the directory to crawl.
 * @param srcFileExtension The file extension to change from. Do not include a period in the string.
 * @param dstFileExtension The file extension to change to. Do not include a period in the string.
 */
export async function renameFileExtensions(
  directoryPath: string,
  srcFileExtension: string,
  dstFileExtension: string,
): Promise<void> {
  const srcFileExtensionWithPeriod = `.${srcFileExtension}`;
  const dstFileExtensionWithPeriod = `.${dstFileExtension}`;

  const matchFunc = (filePath: string) =>
    filePath.endsWith(srcFileExtensionWithPeriod);
  const filePaths = await getMatchingFilePaths(directoryPath, matchFunc);

  const promises: Array<Promise<unknown>> = [];

  for (const filePath of filePaths) {
    const filePathWithoutExtension = trimSuffix(
      filePath,
      srcFileExtensionWithPeriod,
    );
    const newFilePath = filePathWithoutExtension + dstFileExtensionWithPeriod;
    const promise = fs.promises.rename(filePath, newFilePath);
    promises.push(promise);
  }

  await Promise.all(promises);
}

/** Alias for the `deleteFileOrDirectory` function. Intended to be used in scripts. */
export function rm(...filePaths: readonly string[]): void {
  deleteFileOrDirectory(...filePaths);
}

/**
 * Helper function to synchronously write 0 bytes to a file, similar to the `touch` command.
 *
 * This will throw an error if the file cannot be written to.
 */
export function touch(filePath: string): void {
  if (isDirectory(filePath)) {
    throw new Error(
      `Failed to touch the "${filePath}" file since it was a directory.`,
    );
  } else if (isFile(filePath)) {
    try {
      fs.accessSync(filePath);
      const now = new Date();
      fs.utimesSync(filePath, now, now);
    } catch (error) {
      throw new Error(`Failed to touch the "${filePath}" file: ${error}`);
    }
  } else {
    writeFile(filePath, "");
  }
}

/**
 * Helper function to asynchronously write 0 bytes to a file, similar to the `touch` command.
 *
 * This will throw an error if the file cannot be written to.
 */
export async function touchAsync(filePath: string): Promise<void> {
  const directoryExists = await isDirectoryAsync(filePath);
  if (directoryExists) {
    throw new Error(
      `Failed to touch the "${filePath}" file since it was a directory.`,
    );
  }

  const fileExists = await isFileAsync(filePath);
  if (fileExists) {
    try {
      await fs.promises.access(filePath);
      const now = new Date();
      await fs.promises.utimes(filePath, now, now);
    } catch (error) {
      throw new Error(`Failed to touch the "${filePath}" file: ${error}`);
    }
  } else {
    await writeFileAsync(filePath, "");
  }
}
