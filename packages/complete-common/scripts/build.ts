import { buildScript } from "complete-node";
import { unbuild } from "./unbuild.js";

await buildScript(import.meta.dirname, async (packageRoot) => {
  await unbuild(packageRoot);
});
