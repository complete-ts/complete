/**
 * Helper functions for working with
 * [package.json](https://docs.npmjs.com/cli/v10/configuring-npm/package-json) files.
 *
 * @module
 */

import type { ReadonlyRecord } from "complete-common";
import { assertDefined, isObject } from "complete-common";
import type { DependencyType } from "../types/DependencyType.js";
import { getFilePath } from "./file.js";
import { readFileAsync } from "./readWrite.js";

const PACKAGE_JSON = "package.json";

/**
 * Helper function to asynchronously get a "package.json" file as an object. This will throw an
 * error if the "package.json" file cannot be found or is otherwise invalid.
 *
 * @param filePathOrDirPath Either the path to a "package.json" file or the path to a directory
 *                          which contains a "package.json" file. If undefined is passed, the
 *                          current working directory will be used.
 */
export async function getPackageJSON(
  filePathOrDirPath: string | undefined,
): Promise<Record<string, unknown>> {
  const filePath = await getFilePath(PACKAGE_JSON, filePathOrDirPath);
  const packageJSONContents = await readFileAsync(filePath);
  const packageJSON = JSON.parse(packageJSONContents) as unknown;
  if (!isObject(packageJSON)) {
    throw new Error(
      `Failed to parse a "${PACKAGE_JSON}" file at the following path: ${filePath}`,
    );
  }

  return packageJSON;
}

/**
 * Helper function to asynchronously get the "dependencies" or "devDependencies" or
 * "peerDependencies" field from a "package.json" file. If the corresponding field does not exist,
 * `undefined` will be returned.
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
export async function getPackageJSONDependencies(
  filePathOrDirPathOrRecord:
    | string
    | ReadonlyRecord<string, unknown>
    | undefined,
  dependencyType: DependencyType = "dependencies",
): Promise<Record<string, string> | undefined> {
  const packageJSON =
    typeof filePathOrDirPathOrRecord === "object"
      ? filePathOrDirPathOrRecord
      : await getPackageJSON(filePathOrDirPathOrRecord);

  const field = packageJSON[dependencyType];
  if (field === undefined) {
    return undefined;
  }

  if (!isObject(field)) {
    throw new Error(
      `Failed to parse the "${dependencyType}" field in a "${PACKAGE_JSON}" file.`,
    );
  }

  for (const [key, value] of Object.entries(field)) {
    if (typeof value !== "string") {
      throw new TypeError(
        `Failed to parse the "${dependencyType}" field in a "${PACKAGE_JSON}" file since the "${key}" entry was not a string.`,
      );
    }
  }

  return field as Record<string, string>;
}

/**
 * Helper function to asynchronously get an arbitrary string field from a "package.json" file. If
 * the field does not exist, `undefined` will be returned. This will throw an error if the
 * "package.json" file cannot be found or the field is not a string.
 *
 * @param filePathOrDirPathOrRecord Either the path to a "package.json" file, the path to a
 *                                 directory which contains a "package.json" file, or a parsed
 *                                 JavaScript object from a JSON file. If undefined is passed, the
 *                                 current working directory will be used.
 * @param fieldName The name of the field to retrieve.
 */
export async function getPackageJSONField(
  filePathOrDirPathOrRecord:
    | string
    | ReadonlyRecord<string, unknown>
    | undefined,
  fieldName: string,
): Promise<string | undefined> {
  const packageJSON =
    typeof filePathOrDirPathOrRecord === "object"
      ? filePathOrDirPathOrRecord
      : await getPackageJSON(filePathOrDirPathOrRecord);

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
 * Helper function to asynchronously get an arbitrary string field from a "package.json" file. This
 * will throw an error if the "package.json" file cannot be found or the field does not exist or if
 * the field is not a string.
 *
 * @param filePathOrDirPathOrRecord Either the path to a "package.json" file, the path to a
 *                                 directory which contains a "package.json" file, or a parsed
 *                                 JavaScript object from a JSON file. If undefined is passed, the
 *                                 current working directory will be used.
 * @param fieldName The name of the field to retrieve.
 */
export async function getPackageJSONFieldMandatory(
  filePathOrDirPathOrRecord:
    | string
    | ReadonlyRecord<string, unknown>
    | undefined,
  fieldName: string,
): Promise<string | undefined> {
  const field = await getPackageJSONField(filePathOrDirPathOrRecord, fieldName);
  assertDefined(
    field,
    `Failed to find the "${fieldName}" field in a "${PACKAGE_JSON}" file.`,
  );
  return field;
}

/**
 * Helper function to asynchronously get N arbitrary string fields from a "package.json" file. This
 * will throw an error if the "package.json" file cannot be found or any of the fields do not exist
 * or any of the fields are not strings.
 *
 * @param filePathOrDirPath Either the path to a "package.json" file or the path to a directory
 *                          which contains a "package.json" file. If undefined is passed, the
 *                          current working directory will be used.
 * @param fieldNames The names of the fields to retrieve.
 */
export async function getPackageJSONFieldsMandatory<T extends string>(
  filePathOrDirPath: string | undefined,
  ...fieldNames: readonly T[]
): Promise<Record<T, string>> {
  const packageJSON = await getPackageJSON(filePathOrDirPath);

  const fields: Partial<Record<T, string>> = {};

  for (const fieldName of fieldNames) {
    // Since we already have the contents of the "package.json" file, nothing asynchronous is
    // actually happening in the `getPackageJSONField` function.
    // eslint-disable-next-line no-await-in-loop
    const field = await getPackageJSONField(packageJSON, fieldName);
    assertDefined(
      field,
      `Failed to find the "${fieldName}" field in a "${PACKAGE_JSON}" file.`,
    );

    fields[fieldName] = field;
  }

  return fields as Record<T, string>;
}

/**
 * Helper function to asynchronously get the "scripts" field from a "package.json" file. If the
 * field does not exist, `undefined` will be returned. This will throw an error if the
 * "package.json" file cannot be found or is otherwise invalid.
 *
 * @param filePathOrDirPathOrRecord Either the path to a "package.json" file, the path to a
 *                                 directory which contains a "package.json" file, or a parsed
 *                                 JavaScript object from a JSON file. If undefined is passed, the
 *                                 current working directory will be used.
 */
export async function getPackageJSONScripts(
  filePathOrDirPathOrRecord:
    | string
    | ReadonlyRecord<string, unknown>
    | undefined,
): Promise<Record<string, string> | undefined> {
  const packageJSON =
    typeof filePathOrDirPathOrRecord === "object"
      ? filePathOrDirPathOrRecord
      : await getPackageJSON(filePathOrDirPathOrRecord);

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
 * Helper function to asynchronously get the "version" field from a "package.json" file. This will
 * throw an error if the "package.json" file cannot be found or the "version" field does not exist
 * or the "version" field is not a string.
 *
 * If you want to allow for the "version" field to not exist, use the `getPackageJSONField` helper
 * function instead.
 *
 * @param filePathOrDirPathOrRecord Either the path to a "package.json" file, the path to a
 *                                 directory which contains a "package.json" file, or a parsed
 *                                 JavaScript object from a JSON file. If undefined is passed, the
 *                                 current working directory will be used.
 */
export async function getPackageJSONVersion(
  filePathOrDirPathOrRecord:
    | string
    | ReadonlyRecord<string, unknown>
    | undefined,
): Promise<string> {
  const version = await getPackageJSONField(
    filePathOrDirPathOrRecord,
    "version",
  );

  if (version === undefined) {
    if (typeof filePathOrDirPathOrRecord === "string") {
      throw new TypeError(
        `Failed to parse the "version" field in a "${PACKAGE_JSON}" file from: ${filePathOrDirPathOrRecord}`,
      );
    }

    throw new TypeError(
      `Failed to parse the "version" field in a "${PACKAGE_JSON}" file.`,
    );
  }

  return version;
}

/**
 * Helper function to asynchronously check if a "package.json" file has a particular script. This
 * will throw an error if the "package.json" file cannot be found or is otherwise invalid.
 *
 * @param filePathOrDirPathOrRecord Either the path to a "package.json" file, the path to a
 *                                 directory which contains a "package.json" file, or a parsed
 *                                 JavaScript object from a JSON file. If undefined is passed, the
 *                                 current working directory will be used.
 * @param scriptName The name of the script to check for.
 */
export async function packageJSONHasScript(
  filePathOrDirPathOrRecord:
    | string
    | ReadonlyRecord<string, unknown>
    | undefined,
  scriptName: string,
): Promise<boolean> {
  const packageJSON =
    typeof filePathOrDirPathOrRecord === "object"
      ? filePathOrDirPathOrRecord
      : await getPackageJSON(filePathOrDirPathOrRecord);

  const scripts = await getPackageJSONScripts(packageJSON);
  if (scripts === undefined) {
    return false;
  }

  const script = scripts[scriptName];
  return script !== undefined;
}
