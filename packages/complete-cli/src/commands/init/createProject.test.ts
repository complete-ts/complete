import { assertObject } from "complete-common";
import {
  $,
  deleteFileOrDirectory,
  PackageManager,
  readFile,
  writeFile,
} from "complete-node";
import os from "node:os";
import path from "node:path";
import { describe, test } from "node:test";
import { createProject } from "./createProject.js";

const TMP_DIR = os.tmpdir();
const PACKAGE_PATH = path.resolve(import.meta.dirname, "..", "..", "..");

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

        await setCompleteCLIDependencyToLocal(projectPath);

        const $$q = $({ cwd: projectPath });
        await $$q`bun install`;
        await $$q`bun run build`;
        await $$q`bun run lint`;
      } finally {
        /// await deleteFileOrDirectory(projectPath);
      }
    },
  );
});

/**
 * We want to test against the development version of `complete-cli`, not the version published on
 * npm.
 */
async function setCompleteCLIDependencyToLocal(projectPath: string) {
  const packageJSONPath = path.join(projectPath, "package.json");
  const packageJSONContents = await readFile(packageJSONPath);
  const packageJSON = JSON.parse(packageJSONContents) as unknown;
  assertObject(
    packageJSON,
    `Failed to parse the "${packageJSONPath}" file as an object.`,
  );

  const { devDependencies } = packageJSON;
  assertObject(
    devDependencies,
    `Failed to parse the "devDependencies" field in the "${packageJSONPath}" file.`,
  );

  devDependencies["complete-cli"] = `file:${PACKAGE_PATH}`;
  const newFileContents = JSON.stringify(packageJSON, undefined, 2);
  await writeFile(packageJSONPath, newFileContents);
}
