import fs from "node:fs";
import path from "node:path";
import { OptionDefaults } from "typedoc";

const TYPE_DOC_FRONTMATTER_PLUGIN_PATH = path.join(
  import.meta.dirname,
  "src",
  "plugins",
  "typedoc-frontmatter.mjs",
);
const TYPE_DOC_FRONTMATTER_PACKAGE_PATH = import.meta
  .resolve("typedoc-plugin-frontmatter");

export function getTypeDocConfig(packageDirectoryPath) {
  const packageName = path.basename(packageDirectoryPath);

  return {
    blockTags: [...OptionDefaults.blockTags, "@allowEmptyVariadic"],
    classPropertiesFormat: "table",
    entryFileName: "index",
    entryPoints: getEntryPoints(packageDirectoryPath),
    enumMembersFormat: "table",
    formatWithPrettier: true,
    githubPages: false,
    indexFormat: "table",
    interfacePropertiesFormat: "table",
    mergeReadme: true,
    out: path.join(import.meta.dirname, "src", "content", "docs", packageName),
    parametersFormat: "table",
    plugin: [
      TYPE_DOC_FRONTMATTER_PACKAGE_PATH,
      TYPE_DOC_FRONTMATTER_PLUGIN_PATH,
      "typedoc-plugin-markdown",
    ],
    propertyMembersFormat: "table",
    readme: path.join(packageDirectoryPath, "website-root.md"),
    router: "module",
    treatWarningsAsErrors: true,
    tsconfig: path.join(packageDirectoryPath, "tsconfig.json"),
    typeDeclarationFormat: "table",
    useCodeBlocks: true,
    validation: {
      invalidLink: true,
      notDocumented: true,
      notExported: true,
    },
  };
}

/**
 * @param {string} packageDirectoryPath
 * @returns {readonly string[]}
 */
function getEntryPoints(packageDirectoryPath) {
  const indexTSPath = path.join(packageDirectoryPath, "src", "index.ts");
  const typeScriptFile = fs.readFileSync(indexTSPath, "utf8");
  const lines = typeScriptFile.split("\n");
  const exportLines = lines.filter((line) => line.startsWith("export"));
  const exportPaths = exportLines.map((line) => {
    const match = /export (?:type )?\* from "(?<insideQuotes>[^"]+)";/v.exec(
      line,
    );
    if (match === null || match.groups === undefined) {
      throw new Error(`Failed to parse line: ${line}`);
    }

    const { insideQuotes } = match.groups;
    if (insideQuotes === undefined) {
      throw new Error(`Failed to parse inside the quotes: ${line}`);
    }

    return insideQuotes;
  });

  return exportPaths.map((exportPath) =>
    path.join(
      packageDirectoryPath,
      exportPath.replace("./", "src/").replace(".js", ".ts"),
    ),
  );
}
