/**
 * Helper functions relating to rewinding the call stack.
 *
 * @module
 */

import { assertDefined } from "complete-common";
import { fileURLToPath } from "node:url";
import { get as getStackFrames } from "stack-trace";

/**
 * Helper function to get the name and file path of the calling function.
 *
 * This function handles both Node.js and Bun. (Bun implements the v8 stack trace API differently.)
 *
 * @param upStackBy Optional. The number of functions to rewind in the calling stack. Default is 1.
 * @param verbose Optional. Shows all of the stack frames. Default is false.
 * @throws If the calling function cannot be determined.
 */
export function getCallingFunction(
  upStackBy = 1,
  verbose = false,
): {
  /** The name of the calling function. */
  name: string;

  /** The full file path to the file that contains the calling function. */
  filePath: string;
} {
  const stackFrames = getStackFrames();

  if (verbose) {
    for (const [i, stackFrame] of stackFrames.entries()) {
      const functionName = stackFrame.getFunctionName();
      const fileName = stackFrame.getFileName();
      console.log(
        `i: ${i}, functionName: ${functionName}, fileName: ${fileName}`,
      );
    }
  }

  /**
   * - The 1st stack frame is from this function.
   * - The 2nd stack frame is from the function that invoked `getCallingFilePath`.
   * - The 3rd stack frame is from the function that called that function.
   */
  const stackFrameIndex = upStackBy + 2;

  const index = stackFrameIndex - 1;
  if (verbose) {
    console.log(`Using a stack frame index of: ${index}`);
  }

  const stackFrame = stackFrames[index];
  assertDefined(
    stackFrame,
    `Failed to get the stack frame of the calling function at index: ${index}`,
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
