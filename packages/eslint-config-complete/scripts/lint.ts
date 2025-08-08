import { $, lintScript, readFile } from "complete-node";
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
  const oldFileContents = await readFile(readmePath);

  await setReadmeRules(true);

  const newFileContents = await readFile(readmePath);
  if (oldFileContents !== newFileContents) {
    console.log(
      `The "docs.ts" script changed the following file: ${readmePath}`,
    );
    console.log('Run: "npm run docs"');
    process.exit(1);
  }
}
