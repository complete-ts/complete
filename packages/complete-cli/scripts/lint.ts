import { diff, lintCommands, readFile } from "complete-node";
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

await lintCommands(import.meta.dirname, [
  "tsc --noEmit",
  "tsc --noEmit --project ./scripts/tsconfig.json",
  "eslint --max-warnings 0 .",
  // eslint-disable-next-line unicorn/prefer-top-level-await
  ["checkGitIgnoreUpdates", checkGitIgnoreUpdates()],
]);

async function checkGitIgnoreUpdates() {
  const localGitIgnore = await readFile(LOCAL_GITIGNORE_PATH);

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
