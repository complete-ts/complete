/**
 * Helper functions that have to do with asserting.
 *
 * @module
 */

import { isObject } from "./types.js";

const TYPES_TO_VALIDATION_FUNCTIONS = {
  string: (val: unknown): val is string => typeof val === "string",
  number: (val: unknown): val is number => typeof val === "number",
  boolean: (val: unknown): val is boolean => typeof val === "boolean",
  object: (val: unknown): val is object =>
    val !== null && typeof val === "object",
  array: (val: unknown): val is unknown[] => Array.isArray(val),
  null: (val: unknown): val is null => val === null,
  undefined: (val: unknown): val is undefined => val === undefined,
  // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
  function: (val: unknown): val is Function => typeof val === "function",
} as const;

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

/** Helper function to throw an error if the provided value is not of the provided type. */
export function assertType(
  value: unknown,
  type: keyof typeof TYPES_TO_VALIDATION_FUNCTIONS,
  msg: string,
): asserts value is unknown {
  const validationFunction = TYPES_TO_VALIDATION_FUNCTIONS[type];
  if (!validationFunction(value)) {
    throw new TypeError(msg);
  }
}
