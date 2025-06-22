import { assertDefined } from "complete-common";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { packageDirectory } from "package-directory";
import { get as getStackFrames } from "stack-trace";
import { isBunRuntime } from "./runtime.js";

/**
 * Helper function to get the directory of the closest "package.json" file, starting from the file
 * that contains the calling function.
 *
 * @param upStackBy Optional. The number of functions to rewind in the calling stack before
 *                  attempting to find the closest "package.json" file. Default is 1.
 * @throws If the calling function cannot be determined or if a "package.json" file cannot be found.
 */
export async function getPackageRoot(upStackBy = 1): Promise<string> {
  const stackFrames = getStackFrames();

  /**
   * - The 1st stack frame is from this function.
   * - The 2nd stack frame is from the calling function.
   */
  const targetStackFrame = upStackBy + 1;

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

  const callingFileName = stackFrame.getFileName();

  // On Node.js, this will be a file URL. On Bun, this will be a normal path.
  const callingFilePath = callingFileName.startsWith("file://")
    ? fileURLToPath(callingFileName)
    : callingFileName;

  const cwd = path.dirname(callingFilePath);
  const projectRoot = await packageDirectory({ cwd });
  assertDefined(
    projectRoot,
    `Failed to get the closest "package.json" file starting in: ${cwd}`,
  );

  return projectRoot;
}
