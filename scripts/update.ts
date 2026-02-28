// Unfortunately, `npm-check-updates` does not properly support updating packages in catalogs:
// https://github.com/raineorshine/npm-check-updates/issues/1543
// In the meantime, we can use a script to temporarily move everything in the "catalog" object to a
// "dependencies" object, such that "npm-check-updates" can update it. Then, we move it back to the
// way that it was.

import { assertObject } from "complete-common";
import { $, assertFile, readFile, writeFile } from "complete-node";
import path from "node:path";

const REPO_ROOT = path.resolve(import.meta.dirname, "..");

/** The list of dependencies that should not be updated. */
const LOCKED_DEPENDENCIES = [
  "prettier-plugin-sh", // https://github.com/un-ts/prettier/issues/489
] as const;

const packageJSONPath = path.join(REPO_ROOT, "package.json");
await assertFile(
  packageJSONPath,
  `Failed to find the "package.json" file at: ${packageJSONPath}`,
);

const oldPackageJSONContents = await readFile(packageJSONPath);
const oldPackageJSON = JSON.parse(oldPackageJSONContents) as unknown;
assertObject(oldPackageJSON, 'The old "package.json" file is not an object.');

const oldWorkspaces = oldPackageJSON["workspaces"];
assertObject(
  oldWorkspaces,
  'The "workspaces" field in the old "package.json" file is not an object.',
);

oldPackageJSON["dependencies"] = oldWorkspaces["catalog"];
oldWorkspaces["catalog"] = undefined;

const modifiedPackageJSONContents = `${JSON.stringify(oldPackageJSON, undefined, 2)}\n`;
await writeFile(packageJSONPath, modifiedPackageJSONContents);

const $$ = $({ cwd: REPO_ROOT });
await $$`bunx --bun npm-check-updates --upgrade --reject ${LOCKED_DEPENDENCIES.join(",")}`;

const newPackageJSONContents = await readFile(packageJSONPath);
const newPackageJSON = JSON.parse(newPackageJSONContents) as unknown;
assertObject(newPackageJSON, 'The new "package.json" file is not an object.');

const newWorkspaces = newPackageJSON["workspaces"];
assertObject(
  newWorkspaces,
  'The "workspaces" field in the new "package.json" file is not an object.',
);

newWorkspaces["catalog"] = newPackageJSON["dependencies"];
newPackageJSON["dependencies"] = undefined;

const fixedPackageJSONContents = `${JSON.stringify(newPackageJSON, undefined, 2)}\n`;
await writeFile(packageJSONPath, fixedPackageJSONContents);

if (oldPackageJSONContents !== fixedPackageJSONContents) {
  await $$`bunx --bun prettier --write ${packageJSONPath}`;
  await $$`bun install`;
}
