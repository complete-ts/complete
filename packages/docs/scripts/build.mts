import { $op, $s, buildScript, cp, rm } from "complete-node";
import path from "node:path";

const PACKAGES_WITH_ONE_PAGE_DOCS = [
  "complete-lint",
  "complete-tsconfig",
  "eslint-config-complete",
  "eslint-plugin-complete",
] as const;

await buildScript(async (packageRoot) => {
  const repoRoot = path.join(packageRoot, "..", "..");

  const docsDir = path.join(packageRoot, "docs");
  rm(docsDir);

  const srcOverviewPath = path.join(packageRoot, "overview.md");
  const dstOverviewPath = path.join(docsDir, "overview.md");
  cp(srcOverviewPath, dstOverviewPath);

  for (const packageName of PACKAGES_WITH_ONE_PAGE_DOCS) {
    const srcPath = path.join(
      repoRoot,
      "packages",
      packageName,
      "website-root.md",
    );
    const dstPath = path.join(packageRoot, "docs", `${packageName}.md`);
    cp(srcPath, dstPath);
  }

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
  cp(srcPluginPath, dstPluginPath);
  const templatePath = path.join(dstPluginPath, "template.md");
  rm(templatePath);

  // Format the TypeDoc output with Prettier, which will remove superfluous backslash escape
  // characters that cause issues with search engine indexing. (However, we must change directories
  // to avoid creating a spurious "node_modules" folder.)
  const $$ = $op({ cwd: repoRoot });
  await $$`prettier ./packages/docs/docs --write`;

  $s`docusaurus build`;
});
