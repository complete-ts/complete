import { buildScript, copyToMonorepoNodeModules } from "complete-node";
import { $ } from "execa";

await buildScript(async (packageRoot) => {
  await $`tsc`;
  copyToMonorepoNodeModules(packageRoot);
});
