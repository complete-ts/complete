/**
 * Helper functions that have to do with
 * [maps](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map).
 *
 * @module
 */

/**
 * Helper function to get the values in a `Map` that match an arbitrary condition. Similar to the
 * `Array.map` method, but works for maps.
 *
 * This is efficient such that it avoids converting the map values into an array.
 *
 * If you want to perform a filter and a map at the same time on an array, use the `filterMap`
 * helper function instead.
 */
// eslint-disable-next-line complete/no-mutable-return
export function mapFilter<K, V>(
  map: ReadonlyMap<K, V>,
  predicate: (value: V) => boolean,
): V[] {
  const array: V[] = [];

  for (const value of map.values()) {
    const match = predicate(value);
    if (match) {
      array.push(value);
    }
  }

  return array;
}

/**
 * Helper function to find a value in a `Map`. Similar to the `Array.find` method, but works for
 * maps.
 *
 * This is efficient such that it avoids converting the map values into an array.
 */
export function mapFind<K, V>(
  map: ReadonlyMap<K, V>,
  predicate: (value: V) => boolean,
): V | undefined {
  for (const value of map.values()) {
    const match = predicate(value);
    if (match) {
      return value;
    }
  }

  return undefined;
}
