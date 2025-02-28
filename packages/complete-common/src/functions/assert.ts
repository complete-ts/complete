/**
 * Helper functions that have to do with asserting.
 *
 * @module
 */

import { isObject } from "./types.js";

/** Helper function to throw an error if the provided value is not a boolean. */
export function assertBoolean(
  value: unknown,
  msg: string,
): asserts value is boolean {
  if (typeof value !== "boolean") {
    throw new TypeError(msg);
  }
}

/**
 * Helper function to throw an error if the provided value is equal to `undefined`.
 *
 * This is useful to have TypeScript narrow a `T | undefined` value to `T` in a concise way.
 */
export function assertDefined<T>(
  value: T,
  ...[msg]: [undefined] extends [T]
    ? [string]
    : [
        "The assertion is useless because the provided value does not contain undefined.",
      ]
): asserts value is Exclude<T, undefined> {
  if (value === undefined) {
    throw new TypeError(msg);
  }
}

/**
 * Helper function to throw an error if the provided value is equal to `null`.
 *
 * This is useful to have TypeScript narrow a `T | null` value to `T` in a concise way.
 */
export function assertNotNull<T>(
  value: T,
  ...[msg]: [null] extends [T]
    ? [string]
    : [
        "The assertion is useless because the provided value does not contain null.",
      ]
): asserts value is Exclude<T, null> {
  if (value === null) {
    throw new TypeError(msg);
  }
}

/** Helper function to throw an error if the provided value is not a number. */
export function assertNumber(
  value: unknown,
  msg: string,
): asserts value is number {
  if (typeof value !== "number") {
    throw new TypeError(msg);
  }
}

/**
 * Helper function to throw an error if the provided value is not an object (i.e. a TypeScript
 * record).
 *
 * This is useful to have TypeScript narrow a `Record<string, unknown> | undefined` value to
 * `Record<string, unknown>` in a concise way.
 *
 * Under the hood, this function uses the `isObject` helper function.
 */
export function assertObject(
  value: unknown,
  msg: string,
): asserts value is Record<string, unknown> {
  if (!isObject(value)) {
    throw new TypeError(msg);
  }
}

/** Helper function to throw an error if the provided value is not a string. */
export function assertString(
  value: unknown,
  msg: string,
): asserts value is string {
  if (typeof value !== "string") {
    throw new TypeError(msg);
  }
}
