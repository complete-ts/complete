import { $, diff, lintScript, readTextFile } from "complete-node";
import path from "node:path";

const PACKAGE_ROOT = path.resolve(import.meta.dirname, "..");
const LOCAL_GITIGNORE_PATH = path.join(
  PACKAGE_ROOT,
  "file-templates",
  "dynamic",
  "Node.gitignore",
);
const GITIGNORE_URL =
  "https://raw.githubusercontent.com/github/gitignore/master/Node.gitignore";

await lintScript(async () => {
  await Promise.all([
    $`tsc --noEmit`,
    $`tsc --noEmit --project ./scripts/tsconfig.json`,
    $`eslint --max-warnings 0 .`,
    checkGitIgnoreUpdates(),
  ]);
});

async function checkGitIgnoreUpdates() {
  const localGitIgnore = await readTextFile(LOCAL_GITIGNORE_PATH);

  const response = await fetch(GITIGNORE_URL);
  const remoteGitIgnore = await response.text();

  if (localGitIgnore !== remoteGitIgnore) {
    console.log('New "Node.gitignore" file:');
    diff(localGitIgnore, remoteGitIgnore);
    console.log();
    console.log(`Get it at: ${GITIGNORE_URL}`);
    process.exit(1);
  }
}
