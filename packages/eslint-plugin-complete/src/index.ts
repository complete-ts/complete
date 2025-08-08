import type { TSESLint } from "@typescript-eslint/utils";
import fs from "node:fs";
import path from "node:path";
import type { ReadonlyRecord } from "./completeCommon.js";
import { isObject } from "./completeCommon.js";
import { configs } from "./configs.js";
import { rules } from "./rules.js";

const { name, version } = getPackageJSONNameAndVersion();

const plugin = {
  meta: {
    name,
    version,
  },
  configs,
  rules,
};

addPluginToConfigs(configs, name);

// ESLint plugins must provide a default export by design.
// eslint-disable-next-line
export default plugin;

/**
 * We parse the package JSON manually since importing JSON files directly in Node is experimental.
 */
function getPackageJSONNameAndVersion() {
  const packageRoot = path.resolve(import.meta.dirname, "..");
  const packageJSONPath = path.join(packageRoot, "package.json");
  let packageJSON: unknown;
  try {
    const packageJSONString = fs.readFileSync(packageJSONPath, "utf8");
    packageJSON = JSON.parse(packageJSONString);
  } catch (error) {
    throw new Error(`Failed to read the file: ${packageJSONPath}`, {
      cause: error,
    });
  }

  if (!isObject(packageJSON)) {
    throw new Error(
      `Failed to parse the "${packageJSONPath}" file since it was not an object.`,
    );
  }

  // eslint-disable-next-line @typescript-eslint/no-shadow
  const { name } = packageJSON;
  if (typeof name !== "string") {
    throw new TypeError(
      'Failed to parse the "name" property of the "package.json" file.',
    );
  }

  // eslint-disable-next-line @typescript-eslint/no-shadow
  const { version } = packageJSON;
  if (typeof version !== "string") {
    throw new TypeError(
      'Failed to parse the "version" property of the "package.json" file.',
    );
  }

  return { name, version };
}

/** @see https://eslint.org/docs/latest/extend/plugins#configs-in-plugins */
function addPluginToConfigs(
  configsToMutate: ReadonlyRecord<string, TSESLint.FlatConfig.Config[]>,
  packageName: unknown,
) {
  if (typeof packageName !== "string") {
    throw new TypeError(
      'Failed to parse the plugin name from the "package.json" file.',
    );
  }

  const packageNameWords = packageName.split("-");
  const pluginName = packageNameWords.at(-1);
  if (pluginName === undefined || pluginName === "") {
    throw new Error("Failed to parse the plugin name from the package name.");
  }

  for (const configArray of Object.values(configsToMutate)) {
    for (const config of configArray) {
      if (config.plugins !== undefined) {
        Object.assign(config.plugins, {
          [pluginName]: plugin,
        });
      }
    }
  }
}
