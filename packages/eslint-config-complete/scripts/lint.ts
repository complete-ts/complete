import { lintCommands, readFile } from "complete-node";
import path from "node:path";
import { setReadmeRules } from "./docs.js";

const PACKAGE_ROOT = path.resolve(import.meta.dirname, "..");

await lintCommands(import.meta.dirname, [
  "tsc --noEmit",
  "tsc --noEmit --project ./scripts/tsconfig.json",
  "eslint --max-warnings 0 .",
  // eslint-disable-next-line unicorn/prefer-top-level-await
  ["checkDocs", checkDocs(PACKAGE_ROOT)],
]);

async function checkDocs(packageRoot: string) {
  const readmePath = path.join(packageRoot, "website-root.md");
  const oldFileContents = await readFile(readmePath);

  await setReadmeRules(true);

  const newFileContents = await readFile(readmePath);
  if (oldFileContents !== newFileContents) {
    throw new Error(
      `The "docs.ts" script changed the "${readmePath}" file. Run: "npm run docs`,
    );
  }
}
