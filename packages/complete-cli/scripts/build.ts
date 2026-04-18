import {
  $,
  buildScript,
  copyFileOrDirectory,
  fixMonorepoPackageDistDirectory,
} from "complete-node";
import path from "node:path";

await buildScript(import.meta.dirname, async (packageRoot) => {
  await $`tsc`;
  await fixMonorepoPackageDistDirectory(packageRoot);

  const fileTemplatesSrc = path.join(packageRoot, "file-templates");
  const fileTemplatesDst = path.join(packageRoot, "dist", "file-templates");
  await copyFileOrDirectory(fileTemplatesSrc, fileTemplatesDst);

  // If rapid-testing is needed during development, we can pack the dependencies using webpack to
  // avoid having to bump the versions of the other monorepo dependencies.
  /// await $`webpack`;
});
