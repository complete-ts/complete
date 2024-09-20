import * as prettier from "prettier";

/**
 * Helper function to format a text string with Prettier.
 *
 * This is useful to ensure that a file is correctly formatted after modifying it but before writing
 * it back to disk.
 */
export async function formatWithPrettier(
  text: string,
  language: "typescript" | "markdown",
  repoRoot: string,
): Promise<string> {
  const prettierConfig = await prettier.resolveConfig(repoRoot);

  return prettier.format(text, {
    parser: language,
    ...prettierConfig,
  });
}

/**
 * Helper function to set the content between two HTML comments.
 *
 * For example, if the string has two lines containing "<!-- RULES_TABLE -->" and "<!-- /RULES_TABLE
 * -->", then you would call this function with a marker name of "RULES_TABLE".
 *
 * @returns The modified string.
 */
export function setContentInsideHTMLMarker(
  original: string,
  text: string,
  markerName: string,
): string {
  const markerStart = newHTMLComment(markerName);
  const markerEnd = newHTMLComment(`/${markerName}`);

  const markerStartIndex = original.indexOf(markerStart);
  const markerEndIndex = original.indexOf(markerEnd);

  if (markerStartIndex === -1) {
    throw new Error(`Failed to find the marker: ${markerStart}`);
  }

  if (markerEndIndex === -1) {
    throw new Error(`Failed to find the marker: ${markerEnd}`);
  }

  if (markerStartIndex > markerEndIndex) {
    throw new Error(
      `The starting marker of "${markerStart}" was found after the ending marker of "${markerEnd}".`,
    );
  }

  if (text !== "") {
    text = `${text}\n`; // eslint-disable-line no-param-reassign
  }

  text = `\n${text}`; // eslint-disable-line no-param-reassign

  const before = original.slice(0, markerStartIndex + markerStart.length);
  const after = original.slice(markerEndIndex);

  return before + text + after;
}

function newHTMLComment(comment: string) {
  return `<!-- ${comment} -->`;
}
