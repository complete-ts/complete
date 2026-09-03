import { mapAsync } from "complete-common";
import {
  copyFileOrDirectory,
  deleteFileOrDirectory,
  getFilePathsInDirectory,
  getMonorepoPackageNames,
  isFile,
} from "complete-node";
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import typeDocPackageNamesJSON from "../typedoc-package-names.json" with { type: "json" };

const TYPE_DOC_PACKAGE_NAMES: ReadonlySet<string> = new Set(
  typeDocPackageNamesJSON,
);

const PACKAGE_ROOT = path.resolve(import.meta.dirname, "..");
const REPO_ROOT = path.resolve(PACKAGE_ROOT, "..", "..");

// Get rid of all previous build output.
const docsDir = path.join(PACKAGE_ROOT, "src", "content", "docs");
await deleteFileOrDirectory(docsDir);

const srcHomepagePath = path.join(PACKAGE_ROOT, "homepage.mdx");
const dstHomepagePath = path.join(docsDir, "index.mdx");
await copyFileOrDirectory(srcHomepagePath, dstHomepagePath);

const srcOverviewPath = path.join(PACKAGE_ROOT, "overview.md");
const dstOverviewPath = path.join(docsDir, "overview.md");
await stageMarkdownFile(srcOverviewPath, dstOverviewPath);

const monorepoPackageNames = await getMonorepoPackageNames(REPO_ROOT);
await mapAsync(monorepoPackageNames, async (packageName) => {
  if (TYPE_DOC_PACKAGE_NAMES.has(packageName)) {
    return;
  }

  const srcPath = path.join(
    REPO_ROOT,
    "packages",
    packageName,
    "website-root.md",
  );
  const fileExists = await isFile(srcPath);
  if (fileExists) {
    const dstPath = path.join(docsDir, `${packageName}.md`);
    await stageMarkdownFile(srcPath, dstPath);
  }
});

const srcPluginPath = path.join(
  REPO_ROOT,
  "packages",
  "eslint-plugin-complete",
  "docs",
);
const dstPluginPath = path.join(docsDir, "eslint-plugin-complete");
await copyFileOrDirectory(srcPluginPath, dstPluginPath);
const templatePath = path.join(dstPluginPath, "template.md");
await deleteFileOrDirectory(templatePath);
await prepareMarkdownDirectory(dstPluginPath);

const srcMarkdownlintPluginPath = path.join(
  REPO_ROOT,
  "packages",
  "markdownlint-rule-complete",
  "docs",
);
const dstMarkdownlintPluginPath = path.join(
  docsDir,
  "markdownlint-rule-complete",
);
await copyFileOrDirectory(srcMarkdownlintPluginPath, dstMarkdownlintPluginPath);
await prepareMarkdownDirectory(dstMarkdownlintPluginPath);

async function prepareMarkdownDirectory(directoryPath: string) {
  const filePaths = await getFilePathsInDirectory(directoryPath, "files", true);
  const markdownFilePaths = filePaths.filter((filePath) =>
    filePath.endsWith(".md"),
  );
  await mapAsync(markdownFilePaths, async (filePath) => {
    await addStarlightFrontmatter(filePath);
  });

  const categoryFilePaths = filePaths.filter((filePath) =>
    filePath.endsWith("_category_.yml"),
  );
  await mapAsync(categoryFilePaths, async (filePath) => {
    await deleteFileOrDirectory(filePath);
  });
}

async function stageMarkdownFile(srcPath: string, dstPath: string) {
  await copyFileOrDirectory(srcPath, dstPath);
  await addStarlightFrontmatter(dstPath);
}

async function addStarlightFrontmatter(filePath: string) {
  const markdown = await readFile(filePath, "utf8");
  const [heading, ...bodyLines] = markdown.split("\n");
  if (heading === undefined || !heading.startsWith("# ")) {
    throw new Error(
      `Markdown file does not start with a level-one heading: ${filePath}`,
    );
  }

  const rawTitle = heading.slice(2);
  const title =
    rawTitle.startsWith("`") && rawTitle.endsWith("`")
      ? rawTitle.slice(1, -1)
      : rawTitle;
  const body = bodyLines.join("\n");
  const stagedMarkdown = `---\ntitle: ${JSON.stringify(title)}\n---\n${body}`;
  await writeFile(filePath, stagedMarkdown);
}
