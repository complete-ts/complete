import { $, buildScript, fixMonorepoPackageDistDirectory } from "complete-node";

await buildScript(async (packageRoot) => {
  await $`tsc`;
  await fixMonorepoPackageDistDirectory(packageRoot);

  // If rapid-testing is needed during development, we can pack the dependencies using webpack to
  // avoid having to bump the versions of the other monorepo dependencies.
  /// await $`webpack`;
});
