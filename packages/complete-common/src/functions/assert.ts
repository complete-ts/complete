/**
 * Helper functions that have to do with asserting.
 *
 * @module
 */

import type { TranspiledEnum } from "../types/TranspiledEnum.js";
import { isEnumValue } from "./enums.js";
import { isObject } from "./types.js";

/** Helper function to throw an error if the provided value is not an array. */
export function assertArray(
  value: unknown,
  msg: string,
): asserts value is unknown[] {
  if (!Array.isArray(value)) {
    throw new TypeError(msg);
  }
}

/**
 * Helper function to throw an error if the provided value is not an array with every element being
 * a boolean.
 */
export function assertArrayBoolean(
  value: unknown,
  msg: string,
): asserts value is boolean[] {
  assertArray(value, msg);

  if (value.some((element) => typeof element !== "boolean")) {
    throw new TypeError(msg);
  }
}

/**
 * Helper function to throw an error if the provided value is not an array with every element being
 * a number.
 */
export function assertArrayNumber(
  value: unknown,
  msg: string,
): asserts value is number[] {
  assertArray(value, msg);

  if (value.some((element) => typeof element !== "number")) {
    throw new TypeError(msg);
  }
}

/**
 * Helper function to throw an error if the provided value is not an array with every element being
 * an object (i.e. a TypeScript record).
 */
export function assertArrayObject(
  value: unknown,
  msg: string,
): asserts value is Array<Record<string, unknown>> {
  assertArray(value, msg);

  if (value.some((element) => !isObject(element))) {
    throw new TypeError(msg);
  }
}

/**
 * Helper function to throw an error if the provided value is not an array with every element being
 * a string.
 */
export function assertArrayString(
  value: unknown,
  msg: string,
): asserts value is string[] {
  assertArray(value, msg);

  if (value.some((element) => typeof element !== "string")) {
    throw new TypeError(msg);
  }
}

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
 * Helper function to throw an error if the provided value is not contained within an enum.
 *
 * @param value The value to check.
 * @param transpiledEnum The enum to check against.
 * @param msg The error message to throw if the check fails.
 * @param set Optional. A set that contains all of the values of an enum. If provided, this function
 *            will check for existence using the set (instead of the enum itself). Using a set
 *            should be more performant for enums with around 52 or more elements.
 */
export function assertEnumValue<T extends TranspiledEnum>(
  value: number | string,
  transpiledEnum: T,
  msg: string,
  set?: ReadonlySet<string | number>,
): asserts value is T[keyof T] {
  if (!isEnumValue(value, transpiledEnum, set)) {
    throw new TypeError(msg);
  }
}

/** Helper function to throw an error if the provided value is not an integer. */
export function assertInteger(
  value: unknown,
  msg: string,
): asserts value is number {
  // `Number.isInteger` will correctly return false for non-number variables such as strings,
  // booleans, and so on.
  if (!Number.isInteger(value)) {
    throw new TypeError(msg);
  }
}

/**
 * Helper function to throw an error if the provided value is not an instance of the expected class.
 *
 * This is useful to have TypeScript narrow a value to a specific type in a concise way.
 */
export function assertIs<
  T extends abstract new (...args: unknown[]) => unknown,
>(
  value: unknown,
  constructor: T,
  msg: string,
): asserts value is InstanceType<T> {
  if (!(value instanceof constructor)) {
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

/** Helper function to throw an error if the provided value is not a string or an empty string. */
export function assertStringNotEmpty(
  value: unknown,
  msg: string,
): asserts value is string {
  assertString(value, msg);

  if (value === "") {
    throw new TypeError(msg);
  }
}
