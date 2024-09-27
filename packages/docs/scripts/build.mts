import { $op, $s, buildScript, cp, rm } from "complete-node";
import path from "node:path";

const PACKAGES_WITH_WEBSITE_ROOT = [
  "complete-common",
  "complete-lint",
  "complete-node",
  "complete-tsconfig",
  "eslint-config-complete",
  "eslint-plugin-complete",
] as const;

await buildScript(async (packageRoot) => {
  const repoRoot = path.join(packageRoot, "..", "..");

  // Get rid of all previous build output.
  const docsDir = path.join(packageRoot, "docs");
  rm(docsDir);

  // Copy the main "Overview" page.
  const srcOverviewPath = path.join(packageRoot, "overview.md");
  const dstOverviewPath = path.join(docsDir, "overview.md");
  cp(srcOverviewPath, dstOverviewPath);

  // Copy all of the "website-root.md" files to match the package names.
  for (const packageName of PACKAGES_WITH_WEBSITE_ROOT) {
    const srcPath = path.join(
      repoRoot,
      "packages",
      packageName,
      "website-root.md",
    );
    const dstPath = path.join(packageRoot, "docs", `${packageName}.md`);
    cp(srcPath, dstPath);
  }

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

async function runTypeDoc(repoRoot: string, packageName: string) {
  const packagePath = path.join(repoRoot, "packages", packageName);
  const $$ = $op({ cwd: packagePath });
  await $$`npm run docs`;

  // TypeDoc generates an index file, which we do not need.
  const readmePath = path.join(
    packagePath,
    "..",
    "docs",
    "docs",
    packageName,
    "README.md",
  );
  rm(readmePath);
}
