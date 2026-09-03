import { mapAsync } from "complete-common";
import {
  copyFileOrDirectory,
  deleteFileOrDirectory,
  getMonorepoPackageNames,
  isFile,
  script,
} from "complete-node";
import path from "node:path";
import typeDocPackageNamesJSON from "../typedoc-package-names.json" with { type: "json" };

const TYPE_DOC_PACKAGE_NAMES: ReadonlySet<string> = new Set(
  typeDocPackageNamesJSON,
);

await script(
  import.meta.dirname,
  async (packageRoot) => {
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
      if (TYPE_DOC_PACKAGE_NAMES.has(packageName)) {
        return;
      }

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

    // markdownlint-rule-complete
    const srcMarkdownlintPluginPath = path.join(
      repoRoot,
      "packages",
      "markdownlint-rule-complete",
      "docs",
    );
    const dstMarkdownlintPluginPath = path.join(
      packageRoot,
      "docs",
      "markdownlint-rule-complete",
    );
    await copyFileOrDirectory(
      srcMarkdownlintPluginPath,
      dstMarkdownlintPluginPath,
    );
  },
  "prepared",
);
