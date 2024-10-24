import {
  $s,
  buildScript,
  deleteFileOrDirectory,
  moveAllFilesInDirectory,
} from "complete-node";
import path from "node:path";

await buildScript((packageRoot) => {
  $s`unbuild`; // We use the `unbuild` library to output both ESM and CJS.

  // `unbuild` does not generate declaration maps, so we must use the `tsc` to generate that.
  $s`tsc --emitDeclarationOnly`;
  const distDir = path.join(packageRoot, "dist");
  const commonDir = path.join(distDir, "complete-common");
  deleteFileOrDirectory(commonDir);
  const completeNodeDir = path.join(distDir, "complete-node");
  const srcDir = path.join(completeNodeDir, "src");
  moveAllFilesInDirectory(srcDir, distDir);
  deleteFileOrDirectory(completeNodeDir);
});
