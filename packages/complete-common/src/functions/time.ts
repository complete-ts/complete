/**
 * Helper functions having to do with time.
 *
 * @module
 */

/**
 * Helper function to get the number of elapsed seconds since a starting time.
 *
 * By default, this function will return a whole number (using `Math.floor` on the result), but this
 * can be disabled with the "roundToInteger" parameter.
 *
 * For example:
 *
 * ```ts
 * const startTime = Date.now();
 * doSomething();
 * const elapsedSeconds = getElapsedSeconds(startTime);
 * ```
 */
export function getElapsedSeconds(
  startTime: number,
  roundToInteger = true,
): number {
  const endTime = Date.now();
  const elapsedMilliseconds = endTime - startTime;
  const elapsedSeconds = elapsedMilliseconds / 1000;

  return roundToInteger ? Math.floor(elapsedSeconds) : elapsedSeconds;
}
