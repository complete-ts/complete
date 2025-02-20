import { lintScript } from "complete-node";
import { $ } from "execa";

await lintScript(async () => {
  await Promise.all([
    $`tsc --noEmit`,
    $`tsc --noEmit --project ./scripts/tsconfig.json`,
    $`eslint --max-warnings 0 .`,
  ]);
});
