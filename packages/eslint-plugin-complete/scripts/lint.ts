import { assertDefined, mapAsync } from "complete-common";
import { $, lintCommands, lintScript, readFile } from "complete-node";
import path from "node:path";
import {
  CONFIGS_DIRECTORY_PATH,
  generateRecommendedTS,
} from "./generateRecommendedTS.js";
import { generateRulesTS, RULES_TS_PATH } from "./generateRulesTS.js";

const CODE_GENERATION_OUTPUT_PATHS = [
  RULES_TS_PATH,
  path.join(CONFIGS_DIRECTORY_PATH, "recommended.ts"),
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
  await checkCodeGeneration();
  await $`bun run docs:check`;
});

async function checkCodeGeneration() {
  const fileContentsMap = new Map<string, string>();

  await mapAsync(CODE_GENERATION_OUTPUT_PATHS, async (filePath) => {
    const fileContents = await readFile(filePath);
    fileContentsMap.set(filePath, fileContents);
  });

  await generateRulesTS();
  await generateRecommendedTS();

  const changedFiles = await mapAsync(
    CODE_GENERATION_OUTPUT_PATHS,
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
    throw new Error('Run "bun run generate" and commit the changes.');
  }
}
