import { $, buildScript } from "complete-node";

await buildScript(async () => {
  await $`webpack`;
});
