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
const COMPLETE_CLI_PATH = path.resolve(import.meta.dirname, "..", "..", "..");

describe("createProject", () => {
  test(
    "init foo - build and lint succeed",
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
        const localDistPath = path.join(COMPLETE_CLI_PATH, "dist");
        await deleteFileOrDirectory(installedDistPath);
        await copyFileOrDirectory(localDistPath, installedDistPath);

        const $$q = $({ cwd: projectPath });
        await $$q`bun run build`;
        await $$q`bun run lint`;
      } finally {
        /// await deleteFileOrDirectory(projectPath);
      }
    },
  );
});
