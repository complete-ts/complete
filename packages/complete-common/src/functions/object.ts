/**
 * Helper functions that have to do with objects.
 *
 * @module
 */

import type { ReadonlyRecord } from "../types/ReadonlyRecord.js";

/**
 * Helper function to get the values in an object that match an arbitrary condition. Similar to the
 * `Array.map` method, but works for objects.
 *
 * This is efficient such that it avoids converting the object values into an array.
 */
// eslint-disable-next-line complete/no-mutable-return
export function objectFilter<K extends string | number | symbol, V>(
  object: ReadonlyRecord<K, V>,
  predicate: (value: V) => boolean,
): V[] {
  const array: V[] = [];

  // eslint-disable-next-line complete/no-for-in
  for (const key in object) {
    const value = object[key];
    const match = predicate(value);
    if (match) {
      array.push(value);
    }
  }

  return array;
}
