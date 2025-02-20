import { buildScript } from "complete-node";
import { $ } from "execa";

await buildScript(async () => {
  await $`tsc`;
});
