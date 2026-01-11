/**
 * Helper functions that have to do with arrays.
 *
 * @module
 */

import { ReadonlySet } from "../types/ReadonlySet.js";
import type { WidenLiteral } from "../types/WidenLiteral.js";
import { assertDefined } from "./assert.js";
import { getRandomInt } from "./random.js";

/**
 * Helper function to copy a two-dimensional array. Note that the sub-arrays will only be shallow
 * copied (using the spread operator).
 */
export function arrayCopyTwoDimensional<T>(
  array: ReadonlyArray<readonly T[]>,
): ReadonlyArray<readonly T[]> {
  const copiedArray: T[][] = [];

  for (const subArray of array) {
    copiedArray.push([...subArray]);
  }

  return copiedArray;
}

/**
 * Helper function for determining if two arrays contain the exact same elements. Note that this
 * only performs a shallow comparison.
 */
export function arrayEquals<T>(
  array1: readonly T[],
  array2: readonly T[],
): boolean {
  if (array1.length !== array2.length) {
    return false;
  }

  return array1.every((array1Element, i) => {
    const array2Element = array2[i];
    return array1Element === array2Element;
  });
}

/**
 * Builds a new array based on the original array without the specified element(s). Returns the new
 * array. If the specified element(s) are not found in the array, it will simply return a shallow
 * copy of the array.
 *
 * If there is more than one matching element in the array, this function will remove all of them.
 *
 * This function is variadic, meaning that you can specify N arguments to remove N elements.
 */
export function arrayRemove<T>(
  originalArray: readonly T[],
  ...elementsToRemove: readonly T[]
): readonly T[] {
  const elementsToRemoveSet = new ReadonlySet(elementsToRemove);

  const array: T[] = [];
  for (const element of originalArray) {
    if (!elementsToRemoveSet.has(element)) {
      array.push(element);
    }
  }

  return array;
}

/**
 * Removes all of the specified element(s) from the array. If the specified element(s) are not found
 * in the array, this function will do nothing.
 *
 * This function is variadic, meaning that you can specify N arguments to remove N elements.
 *
 * If there is more than one matching element in the array, this function will remove every matching
 * element. If you want to only remove the first matching element, use the `arrayRemoveInPlace`
 * function instead.
 *
 * @returns True if one or more elements were removed, false otherwise.
 */
export function arrayRemoveAllInPlace<T>(
  // eslint-disable-next-line complete/prefer-readonly-parameter-types
  array: T[],
  ...elementsToRemove: readonly T[]
): boolean {
  let removedOneOrMoreElements = false;

  for (const element of elementsToRemove) {
    let index: number;
    do {
      index = array.indexOf(element);
      if (index > -1) {
        removedOneOrMoreElements = true;
        array.splice(index, 1);
      }
    } while (index > -1);
  }

  return removedOneOrMoreElements;
}

/**
 * Removes the specified element(s) from the array. If the specified element(s) are not found in the
 * array, this function will do nothing.
 *
 * This function is variadic, meaning that you can specify N arguments to remove N elements.
 *
 * If there is more than one matching element in the array, this function will only remove the first
 * one. If you want to remove all of the elements, use the `arrayRemoveAllInPlace` function instead.
 *
 * @returns The removed elements. This will be an empty array if no elements were removed.
 */
export function arrayRemoveInPlace<T>(
  // eslint-disable-next-line complete/prefer-readonly-parameter-types
  array: T[],
  ...elementsToRemove: readonly T[]
): readonly T[] {
  const removedElements: T[] = [];

  for (const element of elementsToRemove) {
    const index = array.indexOf(element);
    if (index !== -1) {
      const removedElement = array.splice(index, 1);
      removedElements.push(...removedElement);
    }
  }

  return removedElements;
}

/** Helper function to remove all of the elements in an array in-place. */
// eslint-disable-next-line complete/prefer-readonly-parameter-types
export function emptyArray(array: unknown[]): void {
  array.splice(0);
}

/**
 * Helper function to perform an asynchronous filter. The vanilla `Array.filter` method does not
 * wait for promises (and treats them as truthy), so this function runs the predicate on all
 * elements concurrently, awaits the results, and then filters the original array.
 *
 * Usage:
 *
 * ```ts
 * const results = await filterAsync(things, async (thing) => await filterFunc(thing));
 * ```
 *
 * (This is an abstraction around `Promise.all`.)
 */
export async function filterAsync<T>(
  array: readonly T[],
  predicate: (
    element: T,
    index: number,
    array: readonly T[],
  ) => Promise<boolean>,
): Promise<readonly T[]> {
  const results = await Promise.all(
    array.map(async (element, index) => await predicate(element, index, array)),
  );

  return array.filter((_, index) => results[index] === true);
}

/**
 * Helper function to perform a filter and a map at the same time. Similar to `Array.map`, provide a
 * function that transforms a value, but return `undefined` if the value should be skipped. (Thus,
 * this function cannot be used in situations where `undefined` can be a valid array element.)
 *
 * This function is useful because the `Array.map` method will always produce an array with the same
 * amount of elements as the original array.
 *
 * This is named `filterMap` after the Rust function:
 * https://doc.rust-lang.org/std/iter/struct.FilterMap.html
 */
export function filterMap<OldT, NewT>(
  array: readonly OldT[],
  func: (element: OldT) => NewT | undefined,
): readonly NewT[] {
  const filteredArray: NewT[] = [];

  for (const element of array) {
    const newElement = func(element);
    if (newElement !== undefined) {
      filteredArray.push(newElement);
    }
  }

  return filteredArray;
}

/**
 * Helper function to perform a filter and a map at the same time. Similar to `Array.map`, provide a
 * function that transforms a value, but return `undefined` if the value should be skipped. (Thus,
 * this function cannot be used in situations where `undefined` can be a valid array element.)
 *
 * This function is useful because the `Array.map` method will always produce an array with the same
 * amount of elements as the original array.
 *
 * This is named `filterMap` after the Rust function:
 * https://doc.rust-lang.org/std/iter/struct.FilterMap.html
 *
 * This is the asynchronous version, which can be used like this:
 *
 * ```ts
 * const results = await asyncFilterMap(things, someFunc);
 * ```
 *
 * (This is an abstraction around `Promise.all`.)
 */
export async function filterMapAsync<OldT, NewT>(
  array: readonly OldT[],
  func: (
    element: OldT,
    index: number,
    array: readonly OldT[],
  ) => Promise<NewT | undefined>,
): Promise<readonly NewT[]> {
  const promises = array.map(
    async (element, index) => await func(element, index, array),
  );
  const results = await Promise.all(promises);
  return results.filter((item) => item !== undefined);
}

/**
 * Helper function to get a random element from the provided array.
 *
 * Note that this will only work with arrays that do not contain values of `undefined`, since the
 * function uses `undefined` as an indication that the corresponding element does not exist.
 *
 * @param array The array to get an element from.
 * @param exceptions Optional. An array of elements to skip over if selected.
 */
export function getRandomArrayElement<T>(
  array: readonly T[],
  exceptions: readonly T[] = [],
): T {
  if (array.length === 0) {
    throw new Error(
      "Failed to get a random array element since the provided array is empty.",
    );
  }

  const arrayToUse =
    exceptions.length > 0 ? arrayRemove(array, ...exceptions) : array;
  const randomIndex = getRandomArrayIndex(arrayToUse);
  const randomElement = arrayToUse[randomIndex];
  assertDefined(
    randomElement,
    `Failed to get a random array element since the random index of ${randomIndex} was not valid.`,
  );

  return randomElement;
}

/**
 * Helper function to get a random index from the provided array.
 *
 * @param array The array to get the index from.
 * @param exceptions Optional. An array of indexes that will be skipped over when getting the random
 *                   index. Default is an empty array.
 */
export function getRandomArrayIndex(
  array: readonly unknown[],
  exceptions: readonly number[] = [],
): number {
  if (array.length === 0) {
    throw new Error(
      "Failed to get a random array index since the provided array is empty.",
    );
  }

  return getRandomInt(0, array.length - 1, exceptions);
}

/**
 * Similar to the `Array.includes` method, but works on a widened version of the array.
 *
 * This is useful when the normal `Array.includes` produces a type error from an array that uses an
 * `as const` assertion.
 */
export function includes<T, TupleElement extends WidenLiteral<T>>(
  array: readonly TupleElement[],
  searchElement: WidenLiteral<T>,
): searchElement is TupleElement {
  const widenedArray: ReadonlyArray<WidenLiteral<T>> = array;
  return widenedArray.includes(searchElement);
}

/**
 * Similar to the `Array.includes` method, but accepts a variadic amount of search elements.
 *
 * @returns True if any of the elements are found, false otherwise.
 */
export function includesAny<T>(
  array: readonly T[],
  ...searchElements: readonly T[]
): boolean {
  return searchElements.some((element) => array.includes(element));
}

/** A wrapper around `Array.isArray` that narrows to `unknown[]` instead of `any[]`. */
export function isArray(variable: unknown): variable is unknown[] {
  return Array.isArray(variable);
}

/** Helper function to check every value of an array to see if it is a boolean. */
export function isArrayBoolean(variable: unknown): variable is boolean[] {
  if (!isArray(variable)) {
    return false;
  }

  return variable.every((element) => typeof element === "boolean");
}

/** Helper function to check every value of an array to see if it is a number. */
export function isArrayNumber(variable: unknown): variable is number[] {
  if (!isArray(variable)) {
    return false;
  }

  return variable.every((element) => typeof element === "string");
}

/** Helper function to check every value of an array to see if it is a string. */
export function isArrayString(variable: unknown): variable is string[] {
  if (!isArray(variable)) {
    return false;
  }

  return variable.every((element) => typeof element === "string");
}

/**
 * Helper function to perform an asynchronous map. The vanilla `Array.map` method does not wait for
 * promises, resulting in an array of promises rather than the resolved values. This function runs
 * the callback on all elements concurrently, awaits the results, and returns the mapped array.
 *
 * You can also use this function to simply run an asynchronous function on each element of an array
 * concurrently.
 *
 * Usage:
 *
 * ```ts
 * const results = await mapAsync(things, async (thing) => await mapFunc(thing));
 * ```
 *
 * (This is an abstraction around `Promise.all`.)
 */
export async function mapAsync<T, U>(
  array: readonly T[],
  callback: (element: T, index: number, array: readonly T[]) => Promise<U>,
): Promise<readonly U[]> {
  const promises = array.map(
    async (element, index) => await callback(element, index, array),
  );
  return await Promise.all(promises);
}

/** Initializes an array with all elements containing the specified default value. */
export function newArray<T>(length: number, value: T): readonly T[] {
  return Array.from({ length }, () => value);
}

/** Helper function to sum every value in an array together. */
export function sumArray(array: readonly number[]): number {
  return array.reduce((accumulator, element) => accumulator + element, 0);
}
