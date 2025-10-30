import { diff, lintCommands, readFile } from "complete-node";
import path from "node:path";

const PACKAGE_ROOT = path.resolve(import.meta.dirname, "..");
const GITIGNORE_FILE_NAME = "Node.gitignore";
const GITIGNORE_FILE_PATH = path.join(
  PACKAGE_ROOT,
  "file-templates",
  "dynamic",
  GITIGNORE_FILE_NAME,
);
const GITIGNORE_URL = `https://raw.githubusercontent.com/github/gitignore/master/${GITIGNORE_FILE_NAME}`;

await lintCommands(import.meta.dirname, [
  "tsc --noEmit",
  "tsc --noEmit --project ./scripts/tsconfig.json",
  "eslint --max-warnings 0 .",
  // eslint-disable-next-line unicorn/prefer-top-level-await
  ["checkGitIgnoreUpdates", checkGitIgnoreUpdates()],
]);

async function checkGitIgnoreUpdates() {
  const localGitIgnore = await readFile(GITIGNORE_FILE_PATH);
  const response = await fetch(GITIGNORE_URL);
  const remoteGitIgnore = await response.text();

  if (localGitIgnore !== remoteGitIgnore) {
    diff(localGitIgnore, remoteGitIgnore);
    throw new Error(
      `There is a new "${GITIGNORE_FILE_NAME}" file. Get it at:\n${GITIGNORE_URL}`,
    );
  }
}
