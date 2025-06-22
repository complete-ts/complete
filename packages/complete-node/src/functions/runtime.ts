import { isObject } from "complete-common";
import { JavaScriptRuntime } from "../enums/JavaScriptRuntime.js";

/**
 * Helper function to get the current JavaScript runtime, such as Node.js. Returns undefined if the
 * current runtime cannot be detected.
 */
export function getJavaScriptRuntime(): JavaScriptRuntime | undefined {
  // @ts-expect-error Deno may not exist.
  if (typeof Deno !== "undefined") {
    return JavaScriptRuntime.deno;
  }

  // @ts-expect-error Bun may not exist.
  if (typeof Bun !== "undefined") {
    return JavaScriptRuntime.bun;
  }

  // Since "process" exists in both Deno and Bun, the logic for Node.js must come afterward.
  if (
    isObject(process)
    && "versions" in process
    && isObject(process.versions)
    && "node" in process.versions
    && typeof process.versions.node === "string"
    && process.versions.node !== ""
  ) {
    return JavaScriptRuntime.node;
  }

  return undefined;
}

/**
 * Helper function to check if the current JavaScript runtime is Bun.
 *
 * @see https://bun.sh/
 */
export function isBunRuntime(): boolean {
  return getJavaScriptRuntime() === JavaScriptRuntime.bun;
}

/**
 * Helper function to check if the current JavaScript runtime is Deno.
 *
 * @see https://deno.com/
 */
export function isDenoRuntime(): boolean {
  return getJavaScriptRuntime() === JavaScriptRuntime.deno;
}

/**
 * Helper function to check if the current JavaScript runtime is Node.js.
 *
 * @see https://nodejs.org/
 */
export function isNodeRuntime(): boolean {
  return getJavaScriptRuntime() === JavaScriptRuntime.node;
}
