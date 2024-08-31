import { lintCommands } from "complete-node";

await lintCommands([
  `tsc --noEmit`,
  `tsc --noEmit --project ./scripts/tsconfig.json`,
  `eslint --max-warnings 0 .`,
]);
