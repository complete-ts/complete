import path from "node:path";

export const PACKAGE_ROOT = path.resolve(import.meta.dirname, "..");
export const PACKAGE_NAME = path.basename(PACKAGE_ROOT);

export const PLUGIN_NAME = (() => {
  const packageNameWords = PACKAGE_NAME.split("-");
  const pluginName = packageNameWords.at(-1);
  if (pluginName === undefined || pluginName === "") {
    throw new Error("Failed to parse the plugin name from the package name.");
  }

  return pluginName;
})();

export const REPO_ROOT = path.resolve(PACKAGE_ROOT, "..", "..");
