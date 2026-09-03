import { mapAsync } from "complete-common";
import {
  copyFileOrDirectory,
  deleteFileOrDirectory,
  getMonorepoPackageNames,
  isFile,
} from "complete-node";
import path from "node:path";
import typeDocPackageNamesJSON from "../typedoc-package-names.json" with { type: "json" };

const TYPE_DOC_PACKAGE_NAMES: ReadonlySet<string> = new Set(
  typeDocPackageNamesJSON,
);

const PACKAGE_ROOT = path.resolve(import.meta.dirname, "..");
const REPO_ROOT = path.resolve(PACKAGE_ROOT, "..", "..");

// Get rid of all previous build output.
const docsDir = path.join(PACKAGE_ROOT, "docs");
await deleteFileOrDirectory(docsDir);

// Copy the main "Overview" page.
const srcOverviewPath = path.join(PACKAGE_ROOT, "overview.md");
const dstOverviewPath = path.join(docsDir, "overview.md");
await copyFileOrDirectory(srcOverviewPath, dstOverviewPath);

// Copy all of the "website-root.md" files to match the package names.
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
    const dstPath = path.join(PACKAGE_ROOT, "docs", `${packageName}.md`);
    await copyFileOrDirectory(srcPath, dstPath);
  }
});

// eslint-plugin-complete
const srcPluginPath = path.join(
  REPO_ROOT,
  "packages",
  "eslint-plugin-complete",
  "docs",
);
const dstPluginPath = path.join(PACKAGE_ROOT, "docs", "eslint-plugin-complete");
await copyFileOrDirectory(srcPluginPath, dstPluginPath);
const templatePath = path.join(dstPluginPath, "template.md");
await deleteFileOrDirectory(templatePath);

// markdownlint-rule-complete
const srcMarkdownlintPluginPath = path.join(
  REPO_ROOT,
  "packages",
  "markdownlint-rule-complete",
  "docs",
);
const dstMarkdownlintPluginPath = path.join(
  PACKAGE_ROOT,
  "docs",
  "markdownlint-rule-complete",
);
await copyFileOrDirectory(srcMarkdownlintPluginPath, dstMarkdownlintPluginPath);
