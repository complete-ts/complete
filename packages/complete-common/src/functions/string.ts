/**
 * Helper functions that have to do with strings.
 *
 * @module
 */

import { parseIntSafe } from "./utils.js";

// When regular expressions are located at the root instead of inside the function, the functions
// are tested to perform 11% faster.

const DIACRITIC_REGEX = /\p{Diacritic}/u;

/** This is what the Zod validator library uses. */
const EMOJI_REGEX = /(\p{Extended_Pictographic}|\p{Emoji_Component})/u;

const FIRST_LETTER_CAPITALIZED_REGEX = /^\p{Lu}/u;
const KEBAB_CASE_REGEX = /^[\da-z]+(?:-[\da-z]+)*$/;
const SEMANTIC_VERSION_REGEX = /^v*(?<major>\d+)\.(?<minor>\d+)\.(?<patch>\d+)/;
const WHITESPACE_REGEX = /\s/g;
const UPPERCASE_REGEX = /^[A-Z]*$/;
const LOWERCASE_REGEX = /^[a-z]*$/;

/** Helper function to capitalize the first letter of a string. */
export function capitalizeFirstLetter(string: string): string {
  if (string === "") {
    return string;
  }

  const firstCharacter = string.charAt(0);
  const capitalizedFirstLetter = firstCharacter.toUpperCase();
  const restOfString = string.slice(1);

  return `${capitalizedFirstLetter}${restOfString}`;
}

/**
 * Helper function to replace all of the ampersands, less than signs, greater than signs, double
 * quotes, and single quotes in a string with the escaped counterparts. For example, "<" will be
 * replaced with "&lt;".
 */
export function escapeHTMLCharacters(string: string): string {
  return string
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

/**
 * Helper function to get the number of consecutive diacritics in a string.
 *
 * This is useful for sanitization purposes, since many subsequent diacritics can be a sign of a
 * malicious string.
 */
export function getNumConsecutiveDiacritics(string: string): number {
  // First, normalize with Normalization Form Canonical Decomposition (NFD) so that diacritics are
  // separated from other characters:
  // https://en.wikipedia.org/wiki/Unicode_equivalence
  const normalizedString = string.normalize("NFD");

  let numConsecutiveDiacritic = 0;
  let maxConsecutiveDiacritic = 0;

  for (const character of normalizedString) {
    if (hasDiacritic(character)) {
      numConsecutiveDiacritic++;
      if (numConsecutiveDiacritic > maxConsecutiveDiacritic) {
        maxConsecutiveDiacritic = numConsecutiveDiacritic;
      }
    } else {
      numConsecutiveDiacritic = 0;
    }
  }

  return maxConsecutiveDiacritic;
}

/** Helper function to check if a string has one or more diacritics in it. */
export function hasDiacritic(string: string): boolean {
  // First, normalize with Normalization Form Canonical Decomposition (NFD) so that diacritics are
  // separated from other characters:
  // https://en.wikipedia.org/wiki/Unicode_equivalence
  const normalizedString = string.normalize("NFD");

  return DIACRITIC_REGEX.test(normalizedString);
}

/**
 * Helper function to check if a string has one or more emoji in it.
 *
 * Under the hood, this uses the same regex check as the Zod library.
 */
export function hasEmoji(string: string): boolean {
  return EMOJI_REGEX.test(string);
}

/** From: https://stackoverflow.com/questions/1731190/check-if-a-string-has-white-space */
export function hasWhitespace(string: string): boolean {
  return WHITESPACE_REGEX.test(string);
}

/**
 * From:
 * https://stackoverflow.com/questions/8334606/check-if-first-letter-of-word-is-a-capital-letter
 */
export function isFirstLetterCapitalized(string: string): boolean {
  return FIRST_LETTER_CAPITALIZED_REGEX.test(string);
}

/**
 * "kebab-case" is the naming style of using all lowercase and hyphens, like "foo-bar".
 *
 * An empty string is not considered to be kebab-case.
 */
export function isKebabCase(string: string): boolean {
  return KEBAB_CASE_REGEX.test(string);
}

/** Helper function to test if a string contains only lowercase ASCII letters (a through z). */
export function isLowerCase(string: string): boolean {
  return LOWERCASE_REGEX.test(string);
}

/**
 * Helper function to check if a given string is a valid Semantic Version.
 *
 * @see https://semver.org/
 */
export function isSemanticVersion(versionString: string): boolean {
  const match = versionString.match(SEMANTIC_VERSION_REGEX);
  return match !== null;
}

/** Helper function to test if a string contains only uppercase ASCII letters (A through Z). */
export function isUpperCase(string: string): boolean {
  return UPPERCASE_REGEX.test(string);
}

/** Helper function to convert a string from kebab-case to camelCase. */
export function kebabCaseToCamelCase(string: string): string {
  return string.replaceAll(/-./g, (match) => {
    const firstLetterOfWord = match[1];
    return firstLetterOfWord === undefined
      ? ""
      : firstLetterOfWord.toUpperCase();
  });
}

/** Helper function to convert a string from kebab-case to PascalCase. */
export function kebabCaseToPascalCase(string: string): string {
  const camelCase = kebabCaseToCamelCase(string);
  return capitalizeFirstLetter(camelCase);
}

/**
 * Helper function to normalize a string. Specifically, this performs the following steps:
 *
 * - Removes any non-printable characters, if any.
 * - Normalizes all newlines to "\n".
 * - Normalizes all spaces to " ".
 * - Removes leading/trailing whitespace.
 *
 * @see
 * https://stackoverflow.com/questions/11598786/how-to-replace-non-printable-unicode-characters-javascript
 */
export function normalizeString(string: string): string {
  let sanitizedString = string;

  sanitizedString = removeNonPrintableCharacters(sanitizedString);

  // Normalize newlines.
  sanitizedString = sanitizedString.replaceAll("\n\r", "\n");
  sanitizedString = sanitizedString.replaceAll(/\p{Zl}/gu, "\n");
  sanitizedString = sanitizedString.replaceAll(/\p{Zp}/gu, "\n");

  // Normalize spaces.
  sanitizedString = sanitizedString.replaceAll(/\p{Zs}/gu, " ");

  // Remove leading/trailing whitespace.
  sanitizedString = sanitizedString.trim();

  return sanitizedString;
}

/**
 * Helper function to parse a Semantic Versioning string into its individual constituents. Returns
 * undefined if the submitted string was not a proper Semantic Version.
 *
 * @see https://semver.org/
 */
export function parseSemanticVersion(versionString: string):
  | {
      /** The first number inside of the semantic version. */
      majorVersion: number;

      /** The second number inside of the semantic version. */
      minorVersion: number;

      /** The third number inside of the semantic version. */
      patchVersion: number;
    }
  | undefined {
  const match = versionString.match(SEMANTIC_VERSION_REGEX);
  if (match === null || match.groups === undefined) {
    return undefined;
  }

  const { major, minor, patch } = match.groups;
  if (major === undefined || minor === undefined || patch === undefined) {
    return undefined;
  }

  const majorVersion = parseIntSafe(major);
  const minorVersion = parseIntSafe(minor);
  const patchVersion = parseIntSafe(patch);

  if (
    majorVersion === undefined
    || minorVersion === undefined
    || patchVersion === undefined
  ) {
    return undefined;
  }

  return { majorVersion, minorVersion, patchVersion };
}

/* eslint-disable jsdoc/escape-inline-tags */
/**
 * Helper function to remove lines from a multi-line string. This function looks for a "-start" and
 * a "-end" suffix after the marker. Lines with markets will be completely removed from the output.
 *
 * For example, by using a marker of "@foo":
 *
 * ```text
 * line1
 * # @foo-start
 * line2
 * line3
 * # @foo-end
 * line4
 * ```
 *
 * Would return:
 *
 * ```text
 * line1
 * line4
 * ```
 */
/* eslint-enable jsdoc/escape-inline-tags */
export function removeLinesBetweenMarkers(
  string: string,
  marker: string,
): string {
  const lines = string.split("\n");
  const newLines: string[] = [];

  let skippingLines = false;

  for (const line of lines) {
    if (line.includes(`${marker}-start`)) {
      skippingLines = true;
      continue;
    }

    if (line.includes(`${marker}-end`)) {
      skippingLines = false;
      continue;
    }

    if (!skippingLines) {
      newLines.push(line);
    }
  }

  return newLines.join("\n");
}

/** Helper function to remove lines from a multi-line string matching a certain other string. */
export function removeLinesMatching(string: string, match: string): string {
  const lines = string.split("\n");
  const newLines = lines.filter((line) => !line.includes(match));
  return newLines.join("\n");
}

/**
 * Helper function to remove all non-printable characters from a string.
 *
 * @see
 * https://stackoverflow.com/questions/11598786/how-to-replace-non-printable-unicode-characters-javascript
 */
export function removeNonPrintableCharacters(string: string): string {
  return string.replaceAll(/\p{C}/gu, "");
}

/** Helper function to remove all whitespace characters from a string. */
export function removeWhitespace(string: string): string {
  return string.replaceAll(WHITESPACE_REGEX, "");
}

/**
 * Helper function to trim a prefix from a string, if it exists. Returns the trimmed string.
 *
 * @param string The string to trim.
 * @param prefix The prefix to trim.
 * @param trimAll Whether to remove multiple instances of the prefix, if they exist. If this is set
 *                to true, the prefix must only be a single character.
 */
export function trimPrefix(
  string: string,
  prefix: string,
  trimAll = false,
): string {
  if (trimAll) {
    const regExp = new RegExp(`^${prefix}+`, "g");
    return string.replaceAll(regExp, "");
  }

  if (!string.startsWith(prefix)) {
    return string;
  }

  return string.slice(prefix.length);
}

/** Helper function to trim a suffix from a string, if it exists. Returns the trimmed string. */
export function trimSuffix(string: string, prefix: string): string {
  if (!string.endsWith(prefix)) {
    return string;
  }

  const endCharacter = string.length - prefix.length;
  return string.slice(0, endCharacter);
}

/**
 * Helper function to truncate a string to a maximum length. If the length of the string is less
 * than or equal to the provided maximum length, the string will be returned unmodified.
 */
export function truncateString(string: string, maxLength: number): string {
  if (string.length <= maxLength) {
    return string;
  }

  return string.slice(0, maxLength);
}
