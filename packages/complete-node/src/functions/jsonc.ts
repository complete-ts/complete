/**
 * Helper functions for working with
 * [JSONC](https://code.visualstudio.com/docs/languages/json#_json-with-comments).
 *
 * @module
 */

import { isObject } from "complete-common";
import { parse } from "jsonc-parser";
import { readFile } from "./readWrite.js";

/**
 * Helper function to parse a file as
 * [JSONC](https://code.visualstudio.com/docs/languages/json#_json-with-comments).
 *
 * @throws If the file could not be parsed or if the parsed file was not an object.
 */
export async function getJSONC(
  filePath: string,
): Promise<Record<string, unknown>> {
  const fileContents = await readFile(filePath);

  let json: unknown;
  try {
    json = parse(fileContents);
  } catch (error) {
    throw new Error(`Failed to parse a file as JSONC: ${filePath}`, {
      cause: error,
    });
  }

  if (!isObject(json)) {
    throw new Error(
      `Failed to parse "${filePath}" as JSONC, since the contents were not an object.`,
    );
  }

  return json;
}
