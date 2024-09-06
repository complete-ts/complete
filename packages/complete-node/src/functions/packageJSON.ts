import type { ReadonlyRecord } from "complete-common";
import { isObject, setAdd } from "complete-common";
import { getFilePath, readFile, writeFile } from "./file.js";

const PACKAGE_JSON = "package.json";

/**
 * Helper function to get a "package.json" file as an object. This will throw an error if the
 * "package.json" file cannot be found or is otherwise invalid.
 *
 * @param filePathOrDirPath Either the path to a "package.json" file or the path to a directory
 *                          which contains a "package.json" file. If undefined is passed, the
 *                          current working directory will be used.
 */
export function getPackageJSON(
  filePathOrDirPath: string | undefined,
): Record<string, unknown> {
  const filePath = getFilePath(PACKAGE_JSON, filePathOrDirPath);
  const packageJSONContents = readFile(filePath);
  const packageJSON = JSON.parse(packageJSONContents) as unknown;
  if (!isObject(packageJSON)) {
    throw new Error(
      `Failed to parse a "${PACKAGE_JSON}" file at the following path: ${filePath}`,
    );
  }

  return packageJSON;
}

/**
 * Helper function to get the "dependencies" or "devDependencies" or "peerDependencies" field from a
 * "package.json" file. If the corresponding field does not exist, `undefined` will be returned.
 *
 * This will throw an error if the "package.json" file cannot be found or is otherwise invalid.
 *
 * @param filePathOrDirPathOrRecord Either the path to a "package.json" file, the path to a
 *                                 directory which contains a "package.json" file, or a parsed
 *                                 JavaScript object from a JSON file. If undefined is passed, the
 *                                 current working directory will be used.
 * @param dependencyType Optional. The specific dependencies field to get. Defaults to
 *                       "dependencies".
 */
export function getPackageJSONDependencies(
  filePathOrDirPathOrRecord:
    | string
    | ReadonlyRecord<string, unknown>
    | undefined,
  dependencyType:
    | "dependencies"
    | "devDependencies"
    | "peerDependencies" = "dependencies",
): Record<string, string> | undefined {
  const packageJSON =
    typeof filePathOrDirPathOrRecord === "object"
      ? filePathOrDirPathOrRecord
      : getPackageJSON(filePathOrDirPathOrRecord);

  const field = packageJSON[dependencyType];
  if (field === undefined) {
    return undefined;
  }

  if (!isObject(field)) {
    if (typeof filePathOrDirPathOrRecord === "string") {
      // eslint-disable-next-line unicorn/prefer-type-error
      throw new Error(
        `Failed to parse the "${dependencyType}" field in a "${PACKAGE_JSON}" file from: ${filePathOrDirPathOrRecord}`,
      );
    }

    throw new Error(
      `Failed to parse the "${dependencyType}" field in a "${PACKAGE_JSON}" file.`,
    );
  }

  for (const [key, value] of Object.entries(field)) {
    if (typeof value !== "string") {
      // eslint-disable-next-line unicorn/prefer-type-error
      throw new Error(
        `Failed to parse the "${dependencyType}" field in a "${PACKAGE_JSON}" file since the "${key}" entry was not a string.`,
      );
    }
  }

  return field as Record<string, string>;
}

/**
 * Helper function to get an arbitrary string field from a "package.json" file. If the field does
 * not exist, `undefined` will be returned. This will throw an error if the "package.json" file
 * cannot be found or is otherwise invalid.
 *
 * @param filePathOrDirPathOrRecord Either the path to a "package.json" file, the path to a
 *                                 directory which contains a "package.json" file, or a parsed
 *                                 JavaScript object from a JSON file. If undefined is passed, the
 *                                 current working directory will be used.
 * @param fieldName The name of the field to retrieve.
 */
export function getPackageJSONField(
  filePathOrDirPathOrRecord:
    | string
    | ReadonlyRecord<string, unknown>
    | undefined,
  fieldName: string,
): string | undefined {
  const packageJSON =
    typeof filePathOrDirPathOrRecord === "object"
      ? filePathOrDirPathOrRecord
      : getPackageJSON(filePathOrDirPathOrRecord);

  const field = packageJSON[fieldName];
  if (field === undefined) {
    return undefined;
  }

  // Assume that all fields are strings. For objects (like e.g. "dependencies"), other helper
  // functions should be used.
  if (typeof field !== "string") {
    if (typeof filePathOrDirPathOrRecord === "string") {
      // eslint-disable-next-line unicorn/prefer-type-error
      throw new Error(
        `Failed to parse the "${fieldName}" field in a "${PACKAGE_JSON}" file from: ${filePathOrDirPathOrRecord}`,
      );
    }

    throw new Error(
      `Failed to parse the "${fieldName}" field in a "${PACKAGE_JSON}" file.`,
    );
  }

  return field;
}

/**
 * Helper function to get an arbitrary string field from a "package.json" file. This will throw an
 * error if the field does not exist or if the "package.json" file cannot be found.
 *
 * Also see the `getPackageJSONField` function.
 *
 * @param filePathOrDirPathOrRecord Either the path to a "package.json" file, the path to a
 *                                 directory which contains a "package.json" file, or a parsed
 *                                 JavaScript object from a JSON file. If undefined is passed, the
 *                                 current working directory will be used.
 * @param fieldName The name of the field to retrieve.
 */
export function getPackageJSONFieldMandatory(
  filePathOrDirPathOrRecord:
    | string
    | ReadonlyRecord<string, unknown>
    | undefined,
  fieldName: string,
): string {
  const field = getPackageJSONField(filePathOrDirPathOrRecord, fieldName);
  if (field === undefined) {
    throw new Error(
      `Failed to find the "${fieldName}" field in a "${PACKAGE_JSON}" file.`,
    );
  }

  return field;
}

/**
 * Helper function to get N arbitrary string fields from a "package.json" file. This will throw an
 * error if any of the fields do not exist or if the "package.json" file cannot be found.
 *
 * Also see the `getPackageJSONFieldMandatory` function.
 *
 * @param filePathOrDirPath Either the path to a "package.json" file or the path to a directory
 *                          which contains a "package.json" file. If undefined is passed, the
 *                          current working directory will be used.
 * @param fieldNames The names of the fields to retrieve.
 */
export function getPackageJSONFieldsMandatory<T extends string>(
  filePathOrDirPath: string | undefined,
  ...fieldNames: readonly T[]
): Record<T, string> {
  const packageJSON = getPackageJSON(filePathOrDirPath);

  const fields: Partial<Record<T, string>> = {};

  for (const fieldName of fieldNames) {
    const field = getPackageJSONField(packageJSON, fieldName);
    if (field === undefined) {
      throw new Error(
        `Failed to find the "${fieldName}" field in a "${PACKAGE_JSON}" file.`,
      );
    }

    fields[fieldName] = field;
  }

  return fields as Record<T, string>;
}

/**
 * Helper function to get the "scripts" field from a "package.json" file. If the field does not
 * exist, `undefined` will be returned. This will throw an error if the "package.json" file cannot
 * be found or is otherwise invalid.
 *
 * @param filePathOrDirPathOrRecord Either the path to a "package.json" file, the path to a
 *                                 directory which contains a "package.json" file, or a parsed
 *                                 JavaScript object from a JSON file. If undefined is passed, the
 *                                 current working directory will be used.
 */
export function getPackageJSONScripts(
  filePathOrDirPathOrRecord:
    | string
    | ReadonlyRecord<string, unknown>
    | undefined,
): Record<string, string> | undefined {
  const packageJSON =
    typeof filePathOrDirPathOrRecord === "object"
      ? filePathOrDirPathOrRecord
      : getPackageJSON(filePathOrDirPathOrRecord);

  const { scripts } = packageJSON;
  if (scripts === undefined) {
    return undefined;
  }

  if (!isObject(scripts)) {
    if (typeof filePathOrDirPathOrRecord === "string") {
      // eslint-disable-next-line unicorn/prefer-type-error
      throw new Error(
        `Failed to parse the "scripts" field in a "${PACKAGE_JSON}" file from: ${filePathOrDirPathOrRecord}`,
      );
    }

    throw new Error(
      `Failed to parse the "scripts" field in a "${PACKAGE_JSON}" file.`,
    );
  }

  for (const [key, value] of Object.entries(scripts)) {
    if (typeof value !== "string") {
      // eslint-disable-next-line unicorn/prefer-type-error
      throw new Error(
        `Failed to parse the "${key}" script in the "${PACKAGE_JSON}" file.`,
      );
    }
  }

  return scripts as Record<string, string>;
}

/**
 * Helper function to get the "version" field from a "package.json" file. This will throw an error
 * if the "package.json" file cannot be found or is otherwise invalid. It will also throw an error
 * if the "version" field does not exist.
 *
 * If you want to allow for the "version" field not existing, use the `getPackageJSONField` helper
 * function instead.
 *
 * @param filePathOrDirPathOrRecord Either the path to a "package.json" file, the path to a
 *                                 directory which contains a "package.json" file, or a parsed
 *                                 JavaScript object from a JSON file. If undefined is passed, the
 *                                 current working directory will be used.
 */
export function getPackageJSONVersion(
  filePathOrDirPathOrRecord:
    | string
    | ReadonlyRecord<string, unknown>
    | undefined,
): string {
  const version = getPackageJSONField(filePathOrDirPathOrRecord, "version");

  if (version === undefined) {
    if (typeof filePathOrDirPathOrRecord === "string") {
      // eslint-disable-next-line unicorn/prefer-type-error
      throw new Error(
        `Failed to parse the "version" field in a "${PACKAGE_JSON}" file from: ${filePathOrDirPathOrRecord}`,
      );
    }

    throw new Error(
      `Failed to parse the "version" field in a "${PACKAGE_JSON}" file.`,
    );
  }

  return version;
}

/**
 * Helper function to check if a "package.json" file has a particular dependency. Both the
 * "dependencies" and the "devDependencies" fields will be checked. This will throw an error if the
 * "package.json" file cannot be found or is otherwise invalid.
 *
 * This function is variadic, meaning that you can pass as many dependency names as you want to
 * check for. This function will return true if one or more dependencies were found.
 *
 * @param filePathOrDirPathOrRecord Either the path to a "package.json" file, the path to a
 *                                 directory which contains a "package.json" file, or a parsed
 *                                 JavaScript object from a JSON file. If undefined is passed, the
 *                                 current working directory will be used.
 * @param dependencyNames The name of the dependency to check for.
 */
export function isPackageJSONDependency(
  filePathOrDirPathOrRecord:
    | string
    | ReadonlyRecord<string, unknown>
    | undefined,
  ...dependencyNames: readonly string[]
): boolean {
  const dependencySet = new Set<string>();

  const packageJSON =
    typeof filePathOrDirPathOrRecord === "object"
      ? filePathOrDirPathOrRecord
      : getPackageJSON(filePathOrDirPathOrRecord);

  const dependencies = getPackageJSONDependencies(packageJSON, "dependencies");
  if (dependencies !== undefined) {
    setAdd(dependencySet, ...Object.keys(dependencies));
  }

  const devDependencies = getPackageJSONDependencies(
    packageJSON,
    "devDependencies",
  );
  if (devDependencies !== undefined) {
    setAdd(dependencySet, ...Object.keys(devDependencies));
  }

  return dependencyNames.some((dependencyName) =>
    dependencySet.has(dependencyName),
  );
}

/**
 * Helper function to check if a "package.json" file has a particular script. This will throw an
 * error if the "package.json" file cannot be found or is otherwise invalid.
 *
 * @param filePathOrDirPathOrRecord Either the path to a "package.json" file, the path to a
 *                                 directory which contains a "package.json" file, or a parsed
 *                                 JavaScript object from a JSON file. If undefined is passed, the
 *                                 current working directory will be used.
 * @param scriptName The name of the script to check for.
 */
export function packageJSONHasScript(
  filePathOrDirPathOrRecord:
    | string
    | ReadonlyRecord<string, unknown>
    | undefined,
  scriptName: string,
): boolean {
  const packageJSON =
    typeof filePathOrDirPathOrRecord === "object"
      ? filePathOrDirPathOrRecord
      : getPackageJSON(filePathOrDirPathOrRecord);

  const scripts = getPackageJSONScripts(packageJSON);
  if (scripts === undefined) {
    return false;
  }

  const script = scripts[scriptName];
  return script !== undefined;
}

/**
 * Helper function to set a dependency in a "package.json" file to a new value. This will throw an
 * error if the "package.json" file cannot be found or is otherwise invalid.
 *
 * @param filePathOrDirPath Either the path to a "package.json" file or the path to a directory
 *                          which contains a "package.json" file. If undefined is passed, the
 *                          current working directory will be used.
 * @param dependencyName The name of the dependency to update.
 * @param version The new value for the dependency field. Note that most of the time, the version
 *                should have a "^" character prefix to indicate that patch updates should
 *                automatically be downloaded by the package manager.
 * @param dependencyType Optional. The specific dependencies field to update. Defaults to
 *                       "dependencies".
 */
export function setPackageJSONDependency(
  filePathOrDirPath: string | undefined,
  dependencyName: string,
  version: string,
  dependencyType:
    | "dependencies"
    | "devDependencies"
    | "peerDependencies" = "dependencies",
): void {
  const filePath = getFilePath(PACKAGE_JSON, filePathOrDirPath);
  const packageJSON = getPackageJSON(filePath);

  const dependencies =
    getPackageJSONDependencies(packageJSON, dependencyType) ?? {};
  dependencies[dependencyName] = version;
  packageJSON[dependencyType] = dependencies;

  const newFileContents = `${JSON.stringify(packageJSON, undefined, 2)}\n`; // Prettify it.
  writeFile(filePath, newFileContents);
}
