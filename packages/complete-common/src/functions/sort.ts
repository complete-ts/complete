/**
 * Helper functions that have to do with sorting.
 *
 * @module
 */

/**
 * Helper function to perform a case insensitive sort. This will copy the provided array and return
 * the sorted copy.
 *
 * From:
 * https://stackoverflow.com/questions/8996963/how-to-perform-case-insensitive-sorting-array-of-string-in-javascript
 */
export function sortCaseInsensitive(
  array: readonly string[],
): readonly string[] {
  const newArray = [...array];
  newArray.sort((a, b) =>
    a.localeCompare(b, undefined, {
      sensitivity: "base",
    }),
  );

  return newArray;
}
