/**
 * Helper functions for working with [Markdown](https://www.markdownguide.org/).
 *
 * @module
 */

import { readFile, writeFile } from "./readWrite.js";
import { formatWithPrettier, setContentInsideHTMLMarker } from "./string.js";

/**
 * Helper function to insert text inside of a Markdown text file.
 *
 * For example, if a "README.md" file has two lines containing "<!-- RULES_TABLE -->" and "<!--
 * /RULES_TABLE -->", then you would call this function with a marker name of "RULES_TABLE".
 */
export async function setMarkdownContentInsideHTMLMarker(
  filePath: string,
  text: string,
  markerName: string,
  repoRoot: string,
): Promise<void> {
  const originalFileText = readFile(filePath);
  const modifiedFileText = setContentInsideHTMLMarker(
    originalFileText,
    text,
    markerName,
  );

  const formattedModifiedFileText = await formatWithPrettier(
    modifiedFileText,
    "markdown",
    repoRoot,
  );

  if (originalFileText === formattedModifiedFileText) {
    return;
  }

  writeFile(filePath, formattedModifiedFileText);
}
