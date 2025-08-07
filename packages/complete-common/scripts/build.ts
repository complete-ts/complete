import { buildScript } from "complete-node";
import { unbuild } from "./unbuild.js";

await buildScript(async (packageRoot) => {
  await unbuild(packageRoot);
});
