import { capitalizeFirstLetter, mapAsync, trimSuffix } from "complete-common";
import {
  $,
  buildScript,
  copyFileOrDirectory,
  deleteFileOrDirectory,
  deleteLineInFile,
  getFileNamesInDirectory,
  getMonorepoPackageNames,
  isDirectory,
  isFile,
  prependFile,
  readFile,
  replaceTextInFile,
  writeFile,
} from "complete-node";
import path from "node:path";

const CATEGORY_FILE_NAME = "_category_.yml";

await buildScript(import.meta.dirname, async (packageRoot) => {
  const repoRoot = path.resolve(packageRoot, "..", "..");

  // Get rid of all previous build output.
  const docsDir = path.join(packageRoot, "docs");
  await deleteFileOrDirectory(docsDir);

  // Copy the main "Overview" page.
  const srcOverviewPath = path.join(packageRoot, "overview.md");
  const dstOverviewPath = path.join(docsDir, "overview.md");
  await copyFileOrDirectory(srcOverviewPath, dstOverviewPath);

  // Copy all of the "website-root.md" files to match the package names.
  const monorepoPackageNames = await getMonorepoPackageNames(repoRoot);
  await mapAsync(monorepoPackageNames, async (packageName) => {
    const srcPath = path.join(
      repoRoot,
      "packages",
      packageName,
      "website-root.md",
    );
    const fileExists = await isFile(srcPath);
    if (fileExists) {
      const dstPath = path.join(packageRoot, "docs", `${packageName}.md`);
      await copyFileOrDirectory(srcPath, dstPath);
    }
  });

  // Run TypeDoc on the packages that provide library code.
  await runTypeDoc(repoRoot, "complete-common");
  await runTypeDoc(repoRoot, "complete-node");

  // eslint-plugin-complete
  const srcPluginPath = path.join(
    repoRoot,
    "packages",
    "eslint-plugin-complete",
    "docs",
  );
  const dstPluginPath = path.join(
    packageRoot,
    "docs",
    "eslint-plugin-complete",
  );
  await copyFileOrDirectory(srcPluginPath, dstPluginPath);
  const templatePath = path.join(dstPluginPath, "template.md");
  await deleteFileOrDirectory(templatePath);

  // Format the TypeDoc output with Prettier, which will remove superfluous backslash escape
  // characters that cause issues with search engine indexing. (However, we must change directories
  // to avoid creating a spurious "node_modules" directory.)
  const $$ = $({ cwd: repoRoot });
  await $$`prettier ./packages/docs/docs --write`;

  await $`docusaurus build`;
});

async function runTypeDoc(repoRoot: string, packageName: string) {
  const packagePath = path.join(repoRoot, "packages", packageName);
  const $$ = $({ cwd: packagePath });
  await $$`npm run docs`;

  const docsOutputPath = path.resolve(
    packagePath,
    "..",
    "docs",
    "docs",
    packageName,
  );

  // TypeDoc generates an index file, which we do not need.
  const readmePath = path.join(docsOutputPath, "README.md");
  await deleteFileOrDirectory(readmePath);

  const subdirectories = ["enums", "functions", "types"];
  await mapAsync(subdirectories, async (subdirectory) => {
    const directoryPath = path.join(docsOutputPath, subdirectory);
    const directoryExists = await isDirectory(directoryPath);
    if (!directoryExists) {
      return;
    }

    // We want to remove the superfluous prefix in the title.
    const fileNames = await getFileNamesInDirectory(directoryPath);
    await Promise.all(
      fileNames.map(async (fileName) => {
        const filePath = path.join(directoryPath, fileName);
        const newTitle = await getMarkdownTitle(fileName, filePath);

        await deleteLineInFile(filePath, 1); // e.g. # DependencyType
        await prependFile(filePath, `---\ntitle: ${newTitle}\n---\n`);
      }),
    );

    // We want to capitalize the directories in the Docusaurus sidebar, so we add a category file.
    await addCategoryFile(directoryPath);
  });

  // Capitalize the "constants.md" file.
  const constantsPath = path.join(docsOutputPath, "constants.md");
  const constantsExists = await isFile(constantsPath);
  if (constantsExists) {
    await replaceTextInFile(constantsPath, "# constants", "# Constants");
  }
}

/**
 * By default, the title will have a superfluous prefix, like "# types/DependencyType". Remove the
 * prefix and also handle some special edge-cases.
 */
async function getMarkdownTitle(
  fileName: string,
  filePath: string,
): Promise<string> {
  switch (fileName) {
    case "env.md": {
      return "Environment";
    }

    case "npm.md": {
      return "npm";
    }

    case "jsonc.md": {
      return "JSONC";
    }

    case "monorepoPublish.md": {
      return "Monorepo Publishing";
    }

    case "monorepoUpdate.md": {
      return "Monorepo Updating";
    }

    case "nukeDependencies.md": {
      return "Nuke Dependencies";
    }

    case "packageJSON.md": {
      return "Package JSON";
    }

    case "packageManager.md": {
      return "Package Manager";
    }

    case "readWrite.md": {
      return "Read/Write";
    }

    case "scriptHelpers.md": {
      return "Script Helpers";
    }

    default: {
      break;
    }
  }

  const capitalizedFileName = capitalizeFirstLetter(fileName);
  const title = trimSuffix(capitalizedFileName, ".md");

  const fileContents = await readFile(filePath);
  if (fileContents.includes(`### ${title}`)) {
    // There is a header with a duplicate name, which means that any links to this header will be
    // ambiguous. This is not normally a problem, but Docusaurus will throw an error for this case,
    // counting it as a "broken link". Thus, we have to arbitrarily modify the title so that it does
    // not overlap.
    const markdownFileType = getMarkdownFileType(filePath);
    const capitalizedMarkdownFileType = capitalizeFirstLetter(markdownFileType);
    return `${title} (${capitalizedMarkdownFileType})`;
  }

  return title;
}

function getMarkdownFileType(filePath: string): string {
  const dirPath = path.dirname(filePath);
  const dirName = path.basename(dirPath);

  switch (dirName) {
    case "enums": {
      return "enum";
    }

    case "types": {
      return "type";
    }

    default: {
      throw new Error(
        `Failed to detect the type of Markdown file: ${filePath}`,
      );
    }
  }
}

async function addCategoryFile(directoryPath: string) {
  const categoryFilePath = path.join(directoryPath, CATEGORY_FILE_NAME);
  const directoryName = path.basename(directoryPath);
  const label = capitalizeFirstLetter(directoryName);
  const fileContents = `label: ${label}\n`;
  await writeFile(categoryFilePath, fileContents);
}
