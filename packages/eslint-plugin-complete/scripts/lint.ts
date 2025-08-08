import { assertDefined } from "complete-common";
import { $, lintScript, readFile } from "complete-node";
import path from "node:path";
import { generateAll } from "./generate.js";
import { CONFIGS_DIRECTORY_PATH } from "./generateConfigs.js";
import { README_MD_PATH } from "./generateReadme.js";
import { RULES_TS_PATH } from "./generateRules.js";

const FILE_PATHS_TOUCHED_BY_GENERATE_SCRIPT = [
  // From "generateRules.mts":
  RULES_TS_PATH,
  // From "generateConfigs.mts":
  path.join(CONFIGS_DIRECTORY_PATH, "recommended.ts"),
  // From: "generateReadme.mts":
  README_MD_PATH,
] as const;

await lintScript(async () => {
  await Promise.all([
    $`tsc --noEmit`,
    $`tsc --noEmit --project ./scripts/tsconfig.json`,
    $`tsc --noEmit --project ./tests/tsconfig.json`,
    $`eslint --max-warnings 0 .`,
  ]);

  // We cannot do generation at the same time as the other linting because it changes the
  // compilation output, creating a race condition.
  await checkGenerateChangedFiles();
});

async function checkGenerateChangedFiles() {
  const fileContentsMap = new Map<string, string>();

  await Promise.all(
    FILE_PATHS_TOUCHED_BY_GENERATE_SCRIPT.map(async (filePath) => {
      const fileContents = await readFile(filePath);
      fileContentsMap.set(filePath, fileContents);
    }),
  );

  await generateAll(true);

  const changedFiles = await Promise.all(
    FILE_PATHS_TOUCHED_BY_GENERATE_SCRIPT.map(async (filePath) => {
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
    }),
  );

  if (changedFiles.includes(true)) {
    console.log('Run "npm run generate" and commit the changes.');
    process.exit(1);
  }
}
