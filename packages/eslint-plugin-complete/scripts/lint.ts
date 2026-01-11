import { assertDefined, mapAsync } from "complete-common";
import {
  getFilePathsInDirectory,
  lintCommands,
  lintScript,
  readFile,
} from "complete-node";
import path from "node:path";
import { PACKAGE_ROOT } from "./constants.js";
import { generateAll } from "./generate.js";
import { CONFIGS_DIRECTORY_PATH } from "./generateConfigs.js";
import { RULES_TS_PATH } from "./generateRules.js";

const DOCS_RULES_PATHS = path.join(PACKAGE_ROOT, "docs", "rules");
const DOCS_RULES_FILE_PATHS = await getFilePathsInDirectory(DOCS_RULES_PATHS);

const FILE_PATHS_TOUCHED_BY_GENERATE_SCRIPT = [
  // From "generateRules.mts":
  RULES_TS_PATH,
  // From "generateConfigs.mts":
  path.join(CONFIGS_DIRECTORY_PATH, "recommended.ts"),
  // From: "generateReadme.mts":
  path.join(PACKAGE_ROOT, "website-root.md"),
  ...DOCS_RULES_FILE_PATHS,
] as const;

await lintScript(import.meta.dirname, async () => {
  await lintCommands(
    import.meta.dirname,
    [
      "tsc --noEmit",
      "tsc --noEmit --project ./scripts/tsconfig.json",
      "tsc --noEmit --project ./tests/tsconfig.json",
      "eslint",
    ],
    true,
  );

  // We cannot do generation at the same time as the other linting because it changes the
  // compilation output, creating a race condition.
  await checkGenerateChangedFiles();
});

async function checkGenerateChangedFiles() {
  const fileContentsMap = new Map<string, string>();

  await mapAsync(FILE_PATHS_TOUCHED_BY_GENERATE_SCRIPT, async (filePath) => {
    const fileContents = await readFile(filePath);
    fileContentsMap.set(filePath, fileContents);
  });

  await generateAll(true);

  const changedFiles = await mapAsync(
    FILE_PATHS_TOUCHED_BY_GENERATE_SCRIPT,
    async (filePath) => {
      const newFileContents = await readFile(filePath);
      const oldFileContents = fileContentsMap.get(filePath);
      assertDefined(
        oldFileContents,
        `Failed to get the old file contents for path: ${filePath}`,
      );
      if (oldFileContents !== newFileContents) {
        console.log(
          `The "generate.ts" script changed the following file: ${filePath}`,
        );
        return true;
      }

      return false;
    },
  );

  if (changedFiles.includes(true)) {
    throw new Error('Run "npm run generate" and commit the changes.');
  }
}
