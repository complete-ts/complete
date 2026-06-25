/**
 * Helper functions for working with
 * [JSONC](https://code.visualstudio.com/docs/languages/json#_json-with-comments).
 *
 * @module
 */

import { parse } from "jsonc-parser";
import { readFile } from "./readWrite.js";

/**
 * Helper function to parse a file as
 * [JSONC](https://code.visualstudio.com/docs/languages/json#_json-with-comments).
 *
 * @throws If the file could not be parsed.
 */
export async function getJSONC(filePath: string): Promise<unknown> {
  const fileContents = await readFile(filePath);

  let json: unknown;
  try {
    json = parse(fileContents);
  } catch (error) {
    throw new Error(`Failed to parse a file as JSONC: ${filePath}`, {
      cause: error,
    });
  }

  return json;
}
