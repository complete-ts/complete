import { $, deleteFileOrDirectory, PackageManager } from "complete-node";
import os from "node:os";
import path from "node:path";
import { describe, test } from "node:test";
import { createProject } from "./createProject.js";

const TMP_DIR = os.tmpdir();

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

        const $$q = $({ cwd: projectPath });
        await $$q`bun run build`;
        await $$q`bun run lint`;
      } finally {
        /// await deleteFileOrDirectory(projectPath);
      }
    },
  );
});
