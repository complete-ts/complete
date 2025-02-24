import { $, buildScript, fixMonorepoPackageDistDirectory } from "complete-node";

await buildScript(async (packageRoot) => {
  await $`tsc`;
  fixMonorepoPackageDistDirectory(packageRoot);

  /// await $`webpack`;
});
