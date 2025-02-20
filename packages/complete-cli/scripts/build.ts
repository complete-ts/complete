import { buildScript, fixMonorepoPackageDistDirectory } from "complete-node";
import { $ } from "execa";

await buildScript(async (packageRoot) => {
  await $`tsc`;
  fixMonorepoPackageDistDirectory(packageRoot);
});
