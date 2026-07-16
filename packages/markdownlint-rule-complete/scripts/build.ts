import { buildScript } from "complete-node";
import { unbuild } from "../../complete-common/scripts/unbuild.js"; // eslint-disable-line import-x/no-relative-packages

await buildScript(import.meta.dirname, async (packageRoot) => {
  await unbuild(packageRoot);
});
