import fs from "node:fs";
import path from "node:path";
import { OptionDefaults } from "typedoc";

/**
 * Helper function for modules to get the base TypeDoc config used in this monorepo.
 *
 * @param {string} packageDirectoryPath The path to the package directory.
 */
export function getTypeDocConfig(packageDirectoryPath) {
  const packageName = path.basename(packageDirectoryPath);
  const out = path.join(import.meta.dirname, "docs", packageName);
  const entryPoints = getEntryPoints(packageDirectoryPath);

  return {
    out,
    entryPoints,
    // We do not want to generate a readme since the "website-root.md" file is copied to the root of
    // the "docs" directory.
    readme: "none",
    treatWarningsAsErrors: true,
    validation: {
      notExported: true,
      invalidLink: true,
      notDocumented: true,
    },
    githubPages: false, // See: https://typedoc.org/options/output/#githubpages
    blockTags: [...OptionDefaults.blockTags, "@allowEmptyVariadic"],

    plugin: ["typedoc-plugin-markdown"],

    // We copy the options from: https://typedoc-plugin-markdown.org/plugins/docusaurus/options
    hideBreadcrumbs: true,
    hidePageHeader: true,

    // We need to customize the output strategy in order to get the plugin to make one Markdown page
    // per module/category.
    outputFileStrategy: "modules",

    // We customize some of the "typedoc-plugin-markdown" options to make the generated
    // documentation look nicer.
    useCodeBlocks: true,
    indexFormat: "table",
    parametersFormat: "table",
    interfacePropertiesFormat: "table",
    classPropertiesFormat: "table",
    enumMembersFormat: "table",
    typeDeclarationFormat: "table",
    propertyMembersFormat: "table",
  };
}

/**
 * By default, TypeDoc will create a page for each individual function (even if the
 * "entryPointStrategy" is set to "expand"). Instead, we want to create a page per function
 * category.
 *
 * This function parses the "index.ts" file to find all of the individual exports.
 *
 * @param {string} packageDirectoryPath
 * @returns {string[]}
 */
// eslint-disable-next-line complete/no-mutable-return
function getEntryPoints(packageDirectoryPath) {
  // We want one entry point for each export source file, which will correspond to one Markdown file
  // for each source file.
  const indexTSPath = path.join(packageDirectoryPath, "src", "index.ts");
  const typeScriptFile = fs.readFileSync(indexTSPath, "utf8");
  const lines = typeScriptFile.split("\n");
  const exportLines = lines.filter((line) => line.startsWith("export"));
  const exportPaths = exportLines.map((line) => {
    const match = line.match(/export \* from "(.+)";/);
    if (match === null) {
      throw new Error(`Failed to parse line: ${line}`);
    }

    const insideQuotes = match[1];
    if (insideQuotes === undefined) {
      throw new Error(`Failed to parse inside the quotes: ${line}`);
    }

    return insideQuotes;
  });

  return exportPaths.map((exportPath) =>
    exportPath.replaceAll("./", "./src/").replaceAll(".js", ".ts"),
  );
}
