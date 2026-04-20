import { mapAsync } from "complete-common";
import {
  $,
  copyFileOrDirectory,
  deleteFileOrDirectory,
  PackageManager,
} from "complete-node";
import os from "node:os";
import path from "node:path";
import { describe, test } from "node:test";
import { createProject } from "./createProject.js";

const TMP_DIR = os.tmpdir();
const PACKAGES_DIR = path.resolve(import.meta.dirname, "..", "..", "..", "..");
const PACKAGES_TO_BUILD = [
  "complete-cli",
  "complete-common",
  "complete-node",
] as const;

describe("createProject", async () => {
  // Before running any tests, build this package and all parent packages.
  await mapAsync(PACKAGES_TO_BUILD, async (packageName) => {
    const $$ = $({ cwd: path.join(PACKAGES_DIR, packageName) });
    await $$`bun run build`;
  });

  test(
    "init foo with build and lint passing",
    { timeout: 5 * 60 * 1000 },
    async () => {
      const projectPath = path.join(TMP_DIR, "foo");
      await deleteFileOrDirectory(projectPath);
      console.log(`Creating project: ${projectPath}`);

      try {
        await createProject(
          "foo",
          "Alice",
          projectPath,
          true,
          undefined,
          false,
          PackageManager.bun,
        );

        // Replace the installed packages with local development builds so that local code changes
        // are tested rather than the published npm versions. Both "dist" (used by Node.js) and
        // "src" (used by bun via the "bun" export condition) must be replaced.
        await mapAsync(PACKAGES_TO_BUILD, async (packageName) => {
          await mapAsync(["dist", "src"], async (dir) => {
            const srcPath = path.join(PACKAGES_DIR, packageName, dir);
            const dstPath = path.join(
              projectPath,
              "node_modules",
              packageName,
              dir,
            );
            await deleteFileOrDirectory(dstPath);
            await copyFileOrDirectory(srcPath, dstPath);
          });
        });

        const $$q = $({ cwd: projectPath });
        await $$q`bun run build`;
        await $$q`bun run lint`;
      } finally {
        /// await deleteFileOrDirectory(projectPath);
      }
    },
  );
});
