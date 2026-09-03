const fs = require("node:fs");
const path = require("node:path");
const { OptionDefaults } = require("typedoc");
const ts = require("typescript");

/** @type {Readonly<Record<string, string>>} */
const CUSTOM_PAGE_TITLES = {
  env: "Environment",
  jsonc: "JSONC",
  monorepoPublish: "Monorepo Publishing",
  monorepoUpdate: "Monorepo Updating",
  npm: "npm",
  nukeDependencies: "Nuke Dependencies",
  packageJSON: "Package JSON",
  packageManager: "Package Manager",
  readWrite: "Read/Write",
  scriptHelpers: "Script Helpers",
};

/**
 * Helper function for modules to get the base TypeDoc config used in this monorepo.
 *
 * @param {string} packageDirectoryPath The path to the package directory.
 * @returns {import("typedoc").TypeDocOptions}
 */
const getTypeDocConfig = (packageDirectoryPath) => {
  const packageName = path.basename(packageDirectoryPath);
  const out = path.join(__dirname, "docs", packageName);
  const entryPoints = getEntryPoints(packageDirectoryPath);

  return {
    tsconfig: path.join(packageDirectoryPath, "tsconfig.json"),
    plugin: ["typedoc-plugin-markdown"],
    entryPoints,

    readme: path.join(packageDirectoryPath, "website-root.md"),
    mergeReadme: true,

    out,

    // We need to customize the output strategy in order to get the plugin to make one Markdown page
    // per module/category.
    router: "module",

    githubPages: false, // See: https://typedoc.org/options/output/#githubpages
    blockTags: [...OptionDefaults.blockTags, "@allowEmptyVariadic"],
    treatWarningsAsErrors: true,

    validation: {
      notExported: true,
      invalidLink: true,
      notDocumented: true,
    },

    // We customize some of the "typedoc-plugin-markdown" options to make the generated
    // documentation look nicer.
    formatWithPrettier: true,
    useCodeBlocks: true,
    indexFormat: "table",
    parametersFormat: "table",
    interfacePropertiesFormat: "table",
    classPropertiesFormat: "table",
    enumMembersFormat: "table",
    typeDeclarationFormat: "table",
    propertyMembersFormat: "table",
    pageTitleTemplates: {
      module: (args) => getModulePageTitle(args, packageDirectoryPath),
    },
  };
};

/**
 * @param {{rawName: string}} args
 * @param {string} packageDirectoryPath
 * @returns {string}
 */
const getModulePageTitle = ({ rawName }, packageDirectoryPath) => {
  const moduleName = path.basename(rawName);
  const customTitle = CUSTOM_PAGE_TITLES[moduleName];
  const title =
    customTitle ?? moduleName.charAt(0).toUpperCase() + moduleName.slice(1);
  const declarationKind = getMatchingDeclarationKind(
    rawName,
    moduleName,
    packageDirectoryPath,
  );

  return declarationKind === undefined
    ? title
    : `${title} (${declarationKind})`;
};

/**
 * @param {string} rawName
 * @param {string} moduleName
 * @param {string} packageDirectoryPath
 * @returns {string | undefined}
 */
const getMatchingDeclarationKind = (
  rawName,
  moduleName,
  packageDirectoryPath,
) => {
  const directoryName = path.dirname(rawName);
  const declarationKind = {
    enums: "Enum",
    interfaces: "Interface",
    types: "Type",
  }[directoryName];
  if (declarationKind === undefined) {
    return undefined;
  }

  const sourcePath = path.join(packageDirectoryPath, "src", `${rawName}.ts`);
  const sourceFile = ts.createSourceFile(
    sourcePath,
    fs.readFileSync(sourcePath, "utf8"),
    ts.ScriptTarget.Latest,
  );
  const hasMatchingDeclaration = sourceFile.statements.some((statement) => {
    if (directoryName === "types" && ts.isVariableStatement(statement)) {
      return statement.declarationList.declarations.some(
        (declaration) =>
          ts.isIdentifier(declaration.name)
          && declaration.name.text === moduleName,
      );
    }

    const isExpectedDeclaration =
      (directoryName === "enums" && ts.isEnumDeclaration(statement))
      || (directoryName === "interfaces"
        && ts.isInterfaceDeclaration(statement))
      || (directoryName === "types" && ts.isTypeAliasDeclaration(statement));

    return isExpectedDeclaration && statement.name.text === moduleName;
  });

  return hasMatchingDeclaration ? declarationKind : undefined;
};

/**
 * By default, TypeDoc will create a page for each individual function (even if the
 * "entryPointStrategy" is set to "expand"). Instead, we want to create a page per function
 * category.
 *
 * This function parses the "index.ts" file to find all of the individual exports.
 *
 * @param {string} packageDirectoryPath
 * @returns {readonly string[]}
 */
const getEntryPoints = (packageDirectoryPath) => {
  // We want one entry point for each export source file, which will correspond to one Markdown file
  // for each source file.
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
};

module.exports = { getTypeDocConfig };
