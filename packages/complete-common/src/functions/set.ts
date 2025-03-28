/**
 * Helper functions that have to do with
 * [sets](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Set).
 *
 * @module
 */

/**
 * Helper function to add all of the values in one set to another set. The first set passed will be
 * modified in place.
 *
 * This function is variadic, meaning that you can specify N sets to add to the first set.
 */
export function addSetsToSet<T>(
  // eslint-disable-next-line complete/prefer-readonly-parameter-types
  mainSet: Set<T>,
  ...setsToAdd: ReadonlyArray<ReadonlySet<T>>
): void {
  for (const set of setsToAdd) {
    for (const value of set) {
      mainSet.add(value);
    }
  }
}

/**
 * Helper function to create a new set that is the composition of two or more sets.
 *
 * This function is variadic, meaning that you can specify N sets.
 */
export function combineSets<T>(
  ...sets: ReadonlyArray<ReadonlySet<T>>
): ReadonlySet<T> {
  const newSet = new Set<T>();
  for (const set of sets) {
    for (const value of set) {
      newSet.add(value);
    }
  }

  return newSet;
}

/** Helper function to copy a set. (You can also use a Set constructor to accomplish this task.) */
export function copySet<T>(oldSet: ReadonlySet<T>): ReadonlySet<T> {
  const newSet = new Set<T>();
  for (const value of oldSet) {
    newSet.add(value);
  }

  return newSet;
}

/** Helper function to convert the keys of an object to a set. */
export function objectKeysToSet<K extends string | number | symbol, V>(
  object: Record<K, V>,
): ReadonlySet<K> {
  const set = new Set<K>();

  for (const key of Object.keys(object)) {
    set.add(key as K);
  }

  return set;
}

/** Helper function to convert the values of an object to a set. */
export function objectValuesToSet<K extends string | number | symbol, V>(
  object: Record<K, V>,
): ReadonlySet<V> {
  const set = new Set<V>();

  for (const key of Object.values(object)) {
    set.add(key as V);
  }

  return set;
}

/**
 * Helper function to add one or more elements to a set at once without having to repeatedly call
 * the `Set.add` method.
 *
 * This function is variadic, meaning that you can pass as many things as you want to add.
 */
// eslint-disable-next-line complete/prefer-readonly-parameter-types
export function setAdd<T>(set: Set<T>, ...elements: readonly T[]): void {
  for (const element of elements) {
    set.add(element);
  }
}

/**
 * Helper function to check for one or more elements in a set at once without having to repeatedly
 * call the `Set.has` method.
 *
 * This function is variadic, meaning that you can pass as many things as you want to check for. It
 * will return true if one or more elements are found.
 */
export function setHas<T>(
  set: ReadonlySet<T>,
  ...elements: readonly T[]
): boolean {
  return elements.some((element) => set.has(element));
}
