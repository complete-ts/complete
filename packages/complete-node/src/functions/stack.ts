import { assertDefined } from "complete-common";
import { fileURLToPath } from "node:url";
import { get as getStackFrames } from "stack-trace";
import { isBunRuntime } from "./runtime.js";

/**
 * Helper functions relating to rewinding the call stack.
 *
 * @module
 */

/**
 * Helper function to get the name and file path of the calling function.
 *
 * This function handles both Node.js and Bun. (Bun implements the v8 stack trace API differently.)
 *
 * @param upStackBy Optional. The number of functions to rewind in the calling stack. Default is 1.
 * @throws If the calling function cannot be determined.
 */
export function getCallingFunction(upStackBy = 1): {
  name: string;
  filePath: string;
} {
  const stackFrames = getStackFrames();

  /**
   * - The 1st stack frame is from this function.
   * - The 2nd stack frame is from the function that invoked `getCallingFilePath`.
   * - The 3rd stack frame is from the function that called that function.
   */
  const targetStackFrame = upStackBy + 2;

  /**
   * Even though Bun is supposed to emulate the Node.js API, there are twice as many stack frames
   * for some reason.
   */
  const adjustedStackFrame = isBunRuntime()
    ? targetStackFrame * 2
    : targetStackFrame;

  const index = adjustedStackFrame - 1;
  const stackFrame = stackFrames[index];
  assertDefined(
    stackFrame,
    "Failed to get the stack frame of the calling function.",
  );

  const name = stackFrame.getFunctionName();

  /** On Node.js, this will be a file URL. On Bun, this will be a normal path. */
  const fileName = stackFrame.getFileName();
  const filePath = fileName.startsWith("file://")
    ? fileURLToPath(fileName)
    : fileName;

  return {
    name,
    filePath,
  };
}
