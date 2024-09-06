import { $s, buildScript, replaceTextInFile } from "complete-node";
import path from "node:path";

await buildScript(() => {
  $s`unbuild`; // We use the `unbuild` library to output both ESM and CJS.
  fixBuggedReadonlyConstructors();
});

/**
 * For some reason `unbuild` (and `tsup`) will append a "$1" to the `ReadonlyMap` and `ReadonlySet`
 * constructors. Thus, we must manually fix this.
 */
function fixBuggedReadonlyConstructors() {
  removeBuggedTypeSuffix("Map");
  removeBuggedTypeSuffix("Set");
}

function removeBuggedTypeSuffix(typeName: string) {
  const searchValue = `Readonly${typeName}$1`;
  const replaceValue = `Readonly${typeName}`;

  for (const extension of ["ts", "mts", "cts"]) {
    const filePath1 = path.join("dist", `index.d.${extension}`);
    replaceTextInFile(filePath1, searchValue, replaceValue);
  }
}
