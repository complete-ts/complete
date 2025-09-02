/**
 * Helper functions relating to rewinding the call stack.
 *
 * @module
 */

import { assertDefined } from "complete-common";
import errorStackParser from "error-stack-parser";
import { JavaScriptRuntime } from "../enums/JavaScriptRuntime.js";
import { getJavaScriptRuntime } from "./runtime.js";

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
  /** The name of the calling function. Can be undefined on the Bun runtime in certain contexts. */
  functionName: string | undefined;

  /** The full file path to the file that contains the calling function. */
  filePath: string;
} {
  // eslint-disable-next-line unicorn/error-message
  const error = new Error();
  const stackFramesVanilla = errorStackParser.parse(error);
  const stackFrames = fixBunStackFrames(stackFramesVanilla);

  const stackLines: string[] = [];
  for (const [i, stackFrame] of stackFrames.entries()) {
    const fileName = stackFrame.getFileName();
    const functionName = stackFrame.getFunctionName();
    const lineNumber = stackFrame.getLineNumber();
    const columnNumber = stackFrame.getColumnNumber();

    stackLines.push(
      `i: ${i}, fileName: ${fileName}, functionName: ${functionName}, line: ${lineNumber}:${columnNumber}`,
    );
  }

  if (verbose) {
    console.log(stackLines.join("\n"));
  }

  // - The 1st stack frame is from this function.
  // - The 2nd stack frame is from the function that invoked `getCallingFilePath`.
  // - The 3rd stack frame is from the function that called that function.
  const stackFrameIndex = upStackBy + 2;

  const index = stackFrameIndex - 1;
  if (verbose) {
    console.log(`Using a stack frame index of: ${index}`);
  }

  const stackFrame = stackFrames[index];
  assertDefined(
    stackFrame,
    `Failed to get the stack frame of the calling function at index: ${index}\n\n${stackLines.join("\n")}`,
  );

  const functionName = stackFrame.getFunctionName();

  // Even though the method says `getFileName`, it will return a full file path.
  const filePath = stackFrame.getFileName();
  assertDefined(
    filePath,
    `Failed to get the file path from the stack frame of: ${stackFrameIndex}\n\n${stackLines.join("\n")}`,
  );

  return {
    functionName,
    filePath,
  };
}

/**
 * Bun will randomly duplicate stack frames.Thus, we assume that if a function repeats, it is a
 * bugged duplicate. This will fail on recursive functions, but I do not see a better solution.
 *
 * @see https://github.com/oven-sh/bun/issues/22339
 */
function fixBunStackFrames(
  stackFrames: readonly errorStackParser.StackFrame[],
): readonly StackFrame[] {
  // We only have to handle this issue if the runtime is Bun.
  const javaScriptRuntime = getJavaScriptRuntime();
  if (javaScriptRuntime !== JavaScriptRuntime.bun) {
    return stackFrames;
  }

  const fixedStackFrames: errorStackParser.StackFrame[] = [];

  let fileName: string | undefined;
  let functionName: string | undefined;
  for (const stackFrame of stackFrames) {
    const newFileName = stackFrame.getFileName();
    const newFunctionName = stackFrame.getFunctionName();

    if (newFileName === fileName && newFunctionName === functionName) {
      continue;
    }

    fileName = newFileName;
    functionName = newFunctionName;

    fixedStackFrames.push(stackFrame);
  }

  return fixedStackFrames;
}
