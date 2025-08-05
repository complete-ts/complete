/**
 * Helper functions relating to rewinding the call stack.
 *
 * @module
 */

import { assertDefined } from "complete-common";
import { fileURLToPath } from "node:url";
import type { StackFrame } from "stack-trace";
import { get as getStackFrames } from "stack-trace";
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
  /** The name of the calling function. */
  name: string;

  /** The full file path to the file that contains the calling function. */
  filePath: string;
} {
  const stackFrames = getStackFrames();

  if (verbose) {
    for (const [i, stackFrame] of stackFrames.entries()) {
      const fileName = stackFrame.getFileName();
      const functionName = stackFrame.getFunctionName();
      const methodName = stackFrame.getMethodName();
      const typeName = stackFrame.getTypeName();
      const lineNumber = stackFrame.getLineNumber();
      const columnNumber = stackFrame.getColumnNumber();

      console.log(
        `i: ${i}, fileName: ${fileName}, functionName: ${functionName}, methodName: ${methodName}, typeName: ${typeName}, line: ${lineNumber}:${columnNumber}`,
      );
    }
  }

  const javaScriptRuntime = getJavaScriptRuntime();
  assertDefined(
    javaScriptRuntime,
    "Failed to determine the JavaScript runtime.",
  );

  const fixedStackFrames =
    javaScriptRuntime === JavaScriptRuntime.bun
      ? fixBunStackFrames(stackFrames)
      : stackFrames;

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

  const stackFrame = fixedStackFrames[index];
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

/**
 * Bun will randomly duplicate stack frames:
 *
 * ```text
 * $ npx tsx ./scripts/build.ts --verbose
 * Attempting to find the package root with an "upStackBy" of: 3
 * i: 0, fileName: file:///C:/Users/alice/Repositories/infrastructure/node_modules/complete-node/dist/index.mjs, functionName: getCallingFunction, methodName: null, typeName: null, line: 591:23
 * i: 1, fileName: file:///C:/Users/alice/Repositories/infrastructure/node_modules/complete-node/dist/index.mjs, functionName: getPackageRoot, methodName: null, typeName: null, line: 625:24
 * i: 2, fileName: file:///C:/Users/alice/Repositories/infrastructure/node_modules/complete-node/dist/index.mjs, functionName: script, methodName: null, typeName: null, line: 1305:25
 * i: 3, fileName: file:///C:/Users/alice/Repositories/infrastructure/node_modules/complete-node/dist/index.mjs, functionName: buildScript, methodName: null, typeName: null, line: 1278:9
 * i: 4, fileName: file:///C:/Users/alice/Repositories/infrastructure/3_Applications/containers/ci-cd-tasks/scripts/build.ts, functionName: null, methodName: null, typeName: null, line: 1:82
 * i: 5, fileName: node:internal/modules/esm/module_job, functionName: run, methodName: run, typeName: ModuleJob, line: 271:25
 * i: 6, fileName: node:internal/modules/esm/loader, functionName: onImport.tracePromise.__proto__, methodName: null, typeName: null, line: 578:26
 * i: 7, fileName: node:internal/modules/run_main, functionName: asyncRunEntryPointWithESMLoader, methodName: null, typeName: null, line: 116:5
 * ```
 *
 * ```text
 * $ bun run ./scripts/build.ts --verbose
 * Attempting to find the package root with an "upStackBy" of: 3
 * i: 0, fileName: C:\Users\alice\Repositories\infrastructure\node_modules\complete-node\dist\index.mjs, functionName: getCallingFunction, methodName: getCallingFunction, typeName: undefined, line: 591:22
 * i: 1, fileName: C:\Users\alice\Repositories\infrastructure\node_modules\complete-node\dist\index.mjs, functionName: getPackageRoot, methodName: getPackageRoot, typeName: undefined, line: 625:23
 * i: 2, fileName: C:\Users\alice\Repositories\infrastructure\node_modules\complete-node\dist\index.mjs, functionName: getPackageRoot, methodName: getPackageRoot, typeName: undefined, line: 624:30
 * i: 3, fileName: C:\Users\alice\Repositories\infrastructure\node_modules\complete-node\dist\index.mjs, functionName: script, methodName: script, typeName: undefined, line: 1305:24
 * i: 4, fileName: C:\Users\alice\Repositories\infrastructure\node_modules\complete-node\dist\index.mjs, functionName: script, methodName: script, typeName: undefined, line: 1286:22
 * i: 5, fileName: C:\Users\alice\Repositories\infrastructure\node_modules\complete-node\dist\index.mjs, functionName: buildScript, methodName: buildScript, typeName: undefined, line: 1278:8
 * i: 6, fileName: C:\Users\alice\Repositories\infrastructure\node_modules\complete-node\dist\index.mjs, functionName: buildScript, methodName: buildScript, typeName: undefined, line: 1273:27
 * i: 7, fileName: C:\Users\alice\Repositories\infrastructure\3_Applications\containers\ci-cd-tasks\scripts\build.ts, functionName: , methodName: , typeName: undefined, line: 4:6
 * i: 8, fileName: , functionName: asyncModuleEvaluation, methodName: asyncModuleEvaluation, typeName: undefined, line: 2:0
 * i: 9, fileName: , functionName: processTicksAndRejections, methodName: processTicksAndRejections, typeName: undefined, line: 7:38
 * ```
 *
 * Thus, we assume that if a function repeats, it is a bugged duplicate.
 *
 * @see https://discord.com/channels/876711213126520882/1402307800478253237/1402307800478253237
 */
function fixBunStackFrames(
  stackFrames: readonly StackFrame[],
): readonly StackFrame[] {
  const fixedStackFrames: StackFrame[] = [];

  let fileName = "";
  let functionName = "";
  let methodName = "";
  let typeName = "";
  for (const stackFrame of stackFrames) {
    const newFileName = stackFrame.getFileName();
    const newFunctionName = stackFrame.getFunctionName();
    const newMethodName = stackFrame.getMethodName();
    const newTypeName = stackFrame.getTypeName();

    if (
      newFileName === fileName
      && newFunctionName === functionName
      && newMethodName === methodName
      && newTypeName === typeName
    ) {
      continue;
    }

    fileName = newFileName;
    functionName = newFunctionName;
    methodName = newMethodName;
    typeName = newTypeName;

    fixedStackFrames.push(stackFrame);
  }

  return fixedStackFrames;
}
