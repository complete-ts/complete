/**
 * Identity functions that help with narrowing.
 *
 * @module
 */

/**
 * Helper function to narrow an unknown value to an object (i.e. a TypeScript record).
 *
 * Under the hood, this checks for `typeof variable === "object"`, `variable !== null`, and
 * `!Array.isArray(variable)`.
 */
export function isObject(
  variable: unknown,
): variable is Record<string, unknown> {
  return (
    typeof variable === "object"
    && variable !== null
    // The improved return type is not needed in this context.
    // eslint-disable-next-line complete/prefer-is-array
    && !Array.isArray(variable)
  );
}
