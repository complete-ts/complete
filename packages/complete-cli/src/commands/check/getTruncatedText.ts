import { getEnumValues, trimPrefix } from "complete-common";
import {
  fatalError,
  getPackageManagerLockFileNames,
  PackageManager,
} from "complete-node";

const MARKER_CUSTOMIZATION_START = "@template-customization-start";
const MARKER_CUSTOMIZATION_END = "@template-customization-end";
const MARKER_IGNORE_BLOCK_START = "@template-ignore-block-start";
const MARKER_IGNORE_BLOCK_END = "@template-ignore-block-end";
const MARKER_IGNORE_NEXT_LINE = "@template-ignore-next-line";

const PACKAGE_MANAGER_STRINGS = [
  "PACKAGE_MANAGER_NAME",
  "PACKAGE_MANAGER_INSTALL_COMMAND",
  "PACKAGE_MANAGER_LOCK_FILE_NAME",
  ...getEnumValues(PackageManager),
  ...getPackageManagerLockFileNames(),
] as const;

/**
 * @param fileName Used to perform some specific rules based on the template file name.
 * @param text The text to parse.
 * @param ignoreLines A set of lines to remove from the text.
 * @param linesBeforeIgnore A set of lines that will trigger the subsequent line to be ignored.
 * @returns The text of the file with all text removed between any flagged markers (and other
 *          specific hard-coded exclusions), as well as an array of lines that had a
 *          "ignore-next-line" marker below them.
 */
export function getTruncatedText(
  fileName: string,
  text: string,
  ignoreLines: ReadonlySet<string>,
  linesBeforeIgnore: ReadonlySet<string>,
): {
  text: string;
  ignoreLines: ReadonlySet<string>;
  linesBeforeIgnore: ReadonlySet<string>;
} {
  const lines = text.split("\n");

  const newLines: string[] = [];
  const newIgnoreLines = new Set<string>();
  const newLinesBeforeIgnore = new Set<string>();

  let isSkipping = false;
  let isIgnoring = false;
  let shouldIgnoreNextLine = false;
  let previousLine = "";

  for (const line of lines) {
    if (line.trim() === "") {
      continue;
    }

    if (ignoreLines.has(line.trim())) {
      continue;
    }

    if (shouldIgnoreNextLine) {
      shouldIgnoreNextLine = false;
      continue;
    }

    if (linesBeforeIgnore.has(line)) {
      shouldIgnoreNextLine = true;
    }

    // -------------
    // Marker checks
    // -------------

    if (line.includes(MARKER_CUSTOMIZATION_START)) {
      isSkipping = true;
      continue;
    }

    if (line.includes(MARKER_CUSTOMIZATION_END)) {
      isSkipping = false;
      continue;
    }

    if (line.includes(MARKER_IGNORE_BLOCK_START)) {
      isIgnoring = true;
      continue;
    }

    if (line.includes(MARKER_IGNORE_BLOCK_END)) {
      isIgnoring = false;
      continue;
    }

    if (line.includes(MARKER_IGNORE_NEXT_LINE)) {
      shouldIgnoreNextLine = true;

      // We mark the previous line so that we know the next line to skip in the template.
      if (previousLine.trim() === "") {
        fatalError(
          `You cannot have a "${MARKER_IGNORE_NEXT_LINE}" marker before a blank line in the "${fileName}" file.`,
        );
      }
      newLinesBeforeIgnore.add(previousLine);

      continue;
    }

    if (isIgnoring) {
      const baseLine = trimPrefix(line.trim(), "// ");
      newIgnoreLines.add(baseLine);
      continue;
    }

    // --------------------
    // Specific file checks
    // --------------------

    // We should ignore imports in JavaScript or TypeScript files.
    if (fileName.endsWith(".js") || fileName.endsWith(".ts")) {
      if (line === "import {") {
        isSkipping = true;
        continue;
      }

      if (line.startsWith("} from ")) {
        isSkipping = false;
        continue;
      }

      if (line.startsWith("import ")) {
        continue;
      }
    }

    // End-users can have different ignored words.
    if (
      fileName === "cspell.config.jsonc"
      || fileName === "_cspell.config.jsonc"
    ) {
      if (line.match(/"words": \[.*]/) !== null) {
        continue;
      }

      if (line.includes('"words": [')) {
        isSkipping = true;
        continue;
      }

      if ((line.endsWith("]") || line.endsWith("],")) && isSkipping) {
        isSkipping = false;
        continue;
      }
    }

    if (fileName === "ci.yml" || fileName === "action.yml") {
      // End-users can have different package managers.
      if (hasPackageManagerString(line)) {
        continue;
      }

      // Ignore comments, since end-users are expected to delete the explanations.
      if (line.match(/^\s*#/) !== null) {
        continue;
      }
    }

    // ------------
    // Final checks
    // ------------

    if (!isSkipping) {
      newLines.push(line);
      previousLine = line;
    }
  }

  const newText = newLines.join("\n");
  return {
    text: newText,
    ignoreLines: newIgnoreLines,
    linesBeforeIgnore: newLinesBeforeIgnore,
  };
}

function hasPackageManagerString(line: string) {
  return PACKAGE_MANAGER_STRINGS.some((string) => line.includes(string));
}
