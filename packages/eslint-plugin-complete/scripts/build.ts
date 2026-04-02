import { $, buildScript, fixMonorepoPackageDistDirectory } from "complete-node";

await buildScript(import.meta.dirname, async (packageRoot) => {
  await $`tsc`;
  await fixMonorepoPackageDistDirectory(packageRoot);
});
