import { lintCommands } from "complete-node";

await lintCommands(import.meta.dirname, [
  "astro check",
  "tsc --noEmit --project ./scripts/tsconfig.json",
  "eslint",
]);
