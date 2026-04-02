import { lintCommands } from "complete-node";

await lintCommands(import.meta.dirname, [
  "tsc --noEmit",
  "tsc --noEmit --project ./scripts/tsconfig.json",
  "tsc --noEmit --project ./tests/tsconfig.json",
  "eslint",
  "bun run docs",
]);
