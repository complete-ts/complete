import { echo, exit, lintScript, readFile } from "complete-node";
import { $ } from "execa";
import path from "node:path";
import { setReadmeRules } from "./docs.js";

await lintScript(async (packageRoot) => {
  await Promise.all([
    $`tsc --noEmit`,
    $`tsc --noEmit --project ./scripts/tsconfig.json`,
    $`eslint --max-warnings 0 .`,
    checkDocs(packageRoot),
  ]);
});

async function checkDocs(packageRoot: string) {
  const readmePath = path.join(packageRoot, "website-root.md");
  const oldFileContents = readFile(readmePath);

  await setReadmeRules(true);

  const newFileContents = readFile(readmePath);
  if (oldFileContents !== newFileContents) {
    echo(`The "docs.ts" script changed the following file: ${readmePath}`);
    echo('Run: "npm run docs"');
    exit(1);
  }
}
