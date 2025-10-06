import path from "node:path";

export const PACKAGE_ROOT = path.resolve(import.meta.dirname, "..");
const PACKAGE_NAME = path.basename(PACKAGE_ROOT);

export const PLUGIN_NAME = (() => {
  const packageNameWords = PACKAGE_NAME.split("-");
  const lastWord = packageNameWords.at(-1);
  if (lastWord === undefined || lastWord === "") {
    throw new Error("Failed to parse the last word from the package name.");
  }

  return lastWord;
})();

export const REPO_ROOT = path.resolve(PACKAGE_ROOT, "..", "..");
