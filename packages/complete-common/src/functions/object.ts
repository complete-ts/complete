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
export function objectFilter<K extends string | number | symbol, V>(
  object: ReadonlyRecord<K, V>,
  predicate: (value: V) => boolean,
): readonly V[] {
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

/**
 * Helper function to convert an object to a map.
 *
 * This is useful when you need to construct a type safe object with the `satisfies` operator, but
 * then later on you need to query it in a way where you expect the return value to be T or
 * undefined. In this situation, by converting the object to a map, you can avoid unsafe type
 * assertions.
 *
 * Note that the converted map will only have string keys, due to the nature of JavaScript objects
 * only having string keys under the hood.
 */
export function objectToMap<K extends string | number | symbol, V>(
  object: Record<K, V>,
): ReadonlyMap<K, V> {
  const map = new Map<K, V>();

  for (const [key, value] of Object.entries(object)) {
    map.set(key as K, value as V);
  }

  return map;
}

/**
 * Helper function to convert an object to a reverse map.
 *
 * Note that the converted map will only have string keys, due to the nature of JavaScript objects
 * only having string keys under the hood.
 */
export function objectToReverseMap<
  K extends string | number | symbol,
  V extends string | number | symbol,
>(object: Record<K, V>): ReadonlyMap<V, K> {
  const map = new Map<V, K>();

  for (const [key, value] of Object.entries(object)) {
    map.set(value as V, key as K);
  }

  return map;
}
