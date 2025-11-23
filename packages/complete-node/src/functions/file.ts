/**
 * Helper functions for file operations.
 *
 * @module
 */

import { isObject, trimSuffix } from "complete-common";
import { createHash } from "node:crypto";
import type { Dirent } from "node:fs";
import { createReadStream } from "node:fs";
import fs from "node:fs/promises";
import path from "node:path";
import { pipeline } from "node:stream/promises";
import { writeFile } from "./readWrite.js";

/**
 * Helper function to asynchronously copy a file or directory. If a path to a directory is
 * specified, the directory will be recursively copied.
 *
 * @throws If the file cannot be copied.
 */
export async function copyFileOrDirectory(
  srcPath: string,
  dstPath: string,
): Promise<void> {
  try {
    await fs.cp(srcPath, dstPath, {
      recursive: true,
    });
  } catch (error) {
    throw new Error(
      `Failed to copy file or directory "${srcPath}" to "${dstPath}".`,
      {
        cause: error,
      },
    );
  }
}

/**
 * Helper function to asynchronously copy a file or directory. If a path to a directory is
 * specified, the directory will be recursively copied.
 *
 * This is an alias for the `copyFileOrDirectory` function. (It is intended to be used in scripts.)
 *
 * @throws If the file cannot be copied.
 */
export async function cp(srcPath: string, dstPath: string): Promise<void> {
  await copyFileOrDirectory(srcPath, dstPath);
}

/**
 * Helper function to asynchronously delete a file or directory. If a path to a directory is
 * specified, the directory will be recursively deleted. If the path does not exist, this function
 * will be a no-op.
 *
 * This function is variadic, meaning that you can pass as many file paths as you want to delete.
 *
 * @throws If the file cannot be deleted.
 */
export async function deleteFileOrDirectory(
  ...filePaths: readonly string[]
): Promise<void> {
  await Promise.all(
    filePaths.map(async (filePath) => {
      // Deleting files that do not exist will throw an error, so we need to explicitly check for
      // that.
      try {
        await fs.rm(filePath, {
          recursive: true,
        });
      } catch (error) {
        // Deleting files that do not exit should be a no-op. ("ENOENT" means "Error NO ENTry".)
        const isNoEntryError = isObject(error) && error["code"] === "ENOENT";
        if (!isNoEntryError) {
          throw new Error(`Failed to delete file or directory: ${filePath}`, {
            cause: error,
          });
        }
      }
    }),
  );
}

/**
 * Helper function to see if the given file path exists. This will work with files, directories,
 * links, and so on.
 */
export async function exists(filePath: string): Promise<boolean> {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

/**
 * Helper function to get a SHA1 hash for every file in a directory. (This function correctly
 * handles nested subdirectories.)
 *
 * This is useful to see if the contents of a directory have changed in any way.
 *
 * @throws If there is an error when checking the directory.
 */
export async function getDirectoryHashSHA1(
  directoryPath: string,
): Promise<string> {
  const filePaths = await getFilePathsInDirectory(directoryPath, "files", true);

  const fileInfos = await Promise.all(
    filePaths.map(async (filePath) => ({
      filePath,
      hash: await getFileHashSHA1(filePath),
    })),
  );

  // Ensure that the ordering is deterministic.
  const sortedFileInfos = fileInfos.toSorted((a, b) =>
    a.filePath.localeCompare(b.filePath),
  );

  return JSON.stringify(sortedFileInfos);
}

/**
 * Helper function to get the SHA1 hash of a file.
 *
 * @throws If there is an error when reading the file.
 */
export async function getFileHashSHA1(filePath: string): Promise<string> {
  try {
    const hash = createHash("sha1");
    const stream = createReadStream(filePath);
    await pipeline(stream, hash);

    return hash.digest("hex");
  } catch (error) {
    throw new Error(`Failed to get the SHA1 file hash for file: ${filePath}`, {
      cause: error,
    });
  }
}

/**
 * Helper function to asynchronously get the file names or file paths inside of a directory.
 *
 * @param directoryPath The path to the directory.
 * @param filter Optional. If specified, will only return this type of file.
 * @param recursive Optional. If true, will include files in all subdirectories. Default is false.
 * @param paths Optional. If true, will return the full file paths instead of just the file names.
 *              Default is false.
 * @throws If there is an error when checking the directory.
 */
export async function getFileNamesInDirectory(
  directoryPath: string,
  filter?: "files" | "directories",
  recursive = false,
  paths = false,
): Promise<readonly string[]> {
  let fileEntries: Dirent[];
  try {
    fileEntries = await fs.readdir(directoryPath, {
      withFileTypes: true,
      recursive,
    });
  } catch (error) {
    throw new Error(
      `Failed to get the file names in the directory: ${directoryPath}`,
      {
        cause: error,
      },
    );
  }

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

  return paths
    ? filteredFileEntries.map((file) => path.join(file.parentPath, file.name))
    : filteredFileEntries.map((file) => file.name);
}

/**
 * Helper function to synchronously get the path to file, given either a file path, a directory
 * path, or `undefined`.
 *
 * @param fileName The name of the file to find.
 * @param filePathOrDirPath Either the path to a file or the path to a directory which contains the
 *                          file. If undefined is passed, the current working directory will be
 *                          used.
 * @throws If the file cannot be found.
 */
export async function getFilePath(
  fileName: string,
  filePathOrDirPath: string | undefined,
): Promise<string> {
  filePathOrDirPath ??= process.cwd(); // eslint-disable-line no-param-reassign

  const file = await isFile(filePathOrDirPath);
  if (file) {
    return filePathOrDirPath;
  }

  const directory = await isDirectory(filePathOrDirPath);
  if (directory) {
    const filePath = path.join(filePathOrDirPath, fileName);
    const fileInDirectory = await isFile(filePath);
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
 * Helper function to asynchronously get the file paths inside of a directory.
 *
 * @param directoryPath The path to the directory.
 * @param filter Optional. If specified, will only return this type of file. Defaults to returning
 *               both files and directories.
 * @param recursive Optional. If true, will include files in all subdirectories. Default is false.
 * @throws If there is an error when checking the directory.
 */
export async function getFilePathsInDirectory(
  directoryPath: string,
  filter?: "files" | "directories",
  recursive = false,
): Promise<readonly string[]> {
  return await getFileNamesInDirectory(directoryPath, filter, recursive, true);
}

/** Helper function to asynchronously check if the provided path exists and is a directory. */
export async function isDirectory(filePath: string): Promise<boolean> {
  try {
    const stats = await fs.stat(filePath);
    return stats.isDirectory();
  } catch {
    return false;
  }
}

/** Helper function to asynchronously check if the provided path exists and is a file. */
export async function isFile(filePath: string): Promise<boolean> {
  try {
    const stats = await fs.stat(filePath);
    return stats.isFile();
  } catch {
    return false;
  }
}

/**
 * Helper function to see if a directory is the root directory of the file system.
 *
 * Under the hood, this uses `path.normalize` and `path.dirname` to determine this.
 */
export function isFileSystemRootDirectory(directoryPath: string): boolean {
  const normalizedPath = path.normalize(directoryPath);
  const parentPath = path.dirname(normalizedPath);

  return normalizedPath === parentPath;
}

/** Helper function to asynchronously check if the provided path exists and is a symbolic link. */
export async function isLink(filePath: string): Promise<boolean> {
  try {
    const stats = await fs.lstat(filePath);
    return stats.isSymbolicLink();
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
 * Helper function to asynchronously make a new directory. By default, it will recursively make as
 * many subdirectories as needed. If the directory already exists, this function will be a no-op.
 *
 * @param directoryPath The path to the directory to create.
 * @param recursive Optional. Default is true.
 * @throws If the directory cannot be created.
 */
export async function makeDirectory(
  directoryPath: string,
  recursive = true,
): Promise<void> {
  try {
    await fs.mkdir(directoryPath, {
      recursive,
    });
  } catch (error) {
    throw new Error(`Failed to delete file or directory: ${directoryPath}`, {
      cause: error,
    });
  }
}

/**
 * Helper function to asynchronously make a new directory. By default, it will recursively make as
 * many subdirectories as needed. If the directory already exists, this function will be a no-op.
 *
 * This is an alias for the `makeDirectory` function. (It is intended to be used in scripts.)
 *
 * @param directoryPath The path to the directory to create.
 * @param recursive Optional. Default is true.
 * @throws If the directory cannot be created.
 */
export async function mkdir(
  directoryPath: string,
  recursive = true,
): Promise<void> {
  await makeDirectory(directoryPath, recursive);
}

/**
 * Helper function to move all files from one directory to another one.
 *
 * @throws If a file cannot be moved.
 */
export async function moveAllFilesInDirectory(
  srcDirectory: string,
  dstDirectory: string,
): Promise<void> {
  const filePaths = await getFilePathsInDirectory(srcDirectory);
  await Promise.all(
    filePaths.map(async (filePath) => {
      const fileName = path.basename(filePath);
      const dstPath = path.join(dstDirectory, fileName);
      await moveFileOrDirectory(fileName, dstPath);
    }),
  );
}

/**
 * Helper function to asynchronously move a file or directory.
 *
 * This is an alias for the `renameFileOrDirectory` function, since the Node.js API uses the same
 * thing for both operations.
 *
 * @throws If the file cannot be moved.
 */
export async function moveFileOrDirectory(
  srcPath: string,
  dstPath: string,
): Promise<void> {
  await renameFileOrDirectory(srcPath, dstPath);
}

/**
 * Helper function to asynchronously move a file or directory.
 *
 * This is an alias for the `moveFileOrDirectory` function. (It is intended to be used in scripts.)
 *
 * @throws If the file cannot be moved.
 */
export async function mv(srcPath: string, dstPath: string): Promise<void> {
  await moveFileOrDirectory(srcPath, dstPath);
}

/**
 * Helper function to recursively rename all of the files in a directory from one file extension to
 * another.
 *
 * @param directoryPath The path to the directory to crawl.
 * @param srcFileExtension The file extension to change from. Do not include a period in the string.
 * @param dstFileExtension The file extension to change to. Do not include a period in the string.
 * @throws If a file cannot be renamed.
 */
export async function renameFileExtensions(
  directoryPath: string,
  srcFileExtension: string,
  dstFileExtension: string,
): Promise<void> {
  const srcFileExtensionWithPeriod = `.${srcFileExtension}`;
  const dstFileExtensionWithPeriod = `.${dstFileExtension}`;

  const filePaths = await getFilePathsInDirectory(directoryPath, "files", true);
  const filePathsWithExtension = filePaths.filter((filePath) =>
    filePath.endsWith(srcFileExtensionWithPeriod),
  );

  await Promise.all(
    filePathsWithExtension.map(async (filePath) => {
      const filePathWithoutExtension = trimSuffix(
        filePath,
        srcFileExtensionWithPeriod,
      );
      const newFilePath = filePathWithoutExtension + dstFileExtensionWithPeriod;
      await renameFileOrDirectory(filePath, newFilePath);
    }),
  );
}

/**
 * Helper function to asynchronously rename a file. Since renames are not allowed across file system
 * boundaries, this will automatically handle that special case by performing a copy and delete
 * operation instead.
 *
 * @throws If the file cannot be renamed.
 */
export async function renameFileOrDirectory(
  srcPath: string,
  dstPath: string,
): Promise<void> {
  try {
    await fs.rename(srcPath, dstPath);
  } catch (error) {
    // https://stackoverflow.com/questions/43206198/what-does-the-exdev-cross-device-link-not-permitted-error-mean
    if (error instanceof Error && "code" in error && error.code === "EXDEV") {
      try {
        await fs.copyFile(srcPath, dstPath);
        await fs.unlink(srcPath);
      } catch (copyError) {
        throw new Error(
          `Failed to rename "${srcPath}" to "${dstPath}" across a file system boundary.`,
          {
            cause: copyError,
          },
        );
      }
    } else {
      throw new Error(`Failed to rename "${srcPath}" to "${dstPath}".`, {
        cause: error,
      });
    }
  }
}

/**
 * Helper function to asynchronously delete a file or directory. If a path to a directory is
 * specified, the directory will be recursively deleted. If the path does not exist, this function
 * will be a no-op.
 *
 * This function is variadic, meaning that you can pass as many file paths as you want to delete.
 *
 * This is an alias for the `deleteFileOrDirectory` function. (It is intended to be used in
 * scripts.)
 *
 * @throws If the file cannot be deleted.
 */
export async function rm(...filePaths: readonly string[]): Promise<void> {
  await deleteFileOrDirectory(...filePaths);
}

/**
 * Helper function to asynchronously write 0 bytes to a file, similar to the `touch` command.
 *
 * @throws If the file cannot be touched.
 */
export async function touch(filePath: string): Promise<void> {
  const directory = await isDirectory(filePath);
  if (directory) {
    throw new Error(
      `Failed to touch the "${filePath}" file since it was a directory.`,
    );
  }

  const file = await isFile(filePath);
  if (!file) {
    await writeFile(filePath, "");
    return;
  }

  try {
    await fs.access(filePath);
    const now = new Date();
    await fs.utimes(filePath, now, now);
  } catch (error) {
    throw new Error(`Failed to touch file: ${filePath}`, { cause: error });
  }
}
