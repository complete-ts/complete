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
const PACKAGE_ROOT = path.resolve(import.meta.dirname, "..", "..", "..");

describe("createProject", async () => {
  const $$ = $({ cwd: PACKAGE_ROOT });
  await $$`bun run build`;

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

        // Replace the "complete-cli" from npm with the local development build so that
        // "complete-cli check" (invoked by the lint script) tests local code, not the published
        // version.
        const installedDistPath = path.join(
          projectPath,
          "node_modules",
          "complete-cli",
          "dist",
        );
        const localDistPath = path.join(PACKAGE_ROOT, "dist");
        await deleteFileOrDirectory(installedDistPath);
        await copyFileOrDirectory(localDistPath, installedDistPath);

        // `preferLocal` is necessary for `complete-cli` to be in the path.
        const $$q = $({ cwd: projectPath, preferLocal: true });
        await $$q`bun run build`;
        await $$q`bun run lint`;
      } finally {
        /// await deleteFileOrDirectory(projectPath);
      }
    },
  );
});
