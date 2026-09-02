import { $ } from "complete-node";
import { generateRecommendedTS } from "./generateRecommendedTS.js";
import { generateRulesTS } from "./generateRulesTS.js";

if (import.meta.main) {
  await generateAll();
}

export async function generateAll(quiet = false): Promise<void> {
  // Generating rules must come before configs and readme because it builds the "rules.ts" file
  // (which is parsed later on).
  if (!quiet) {
    console.log('Generating "rules.ts"...');
  }
  await generateRulesTS();

  if (!quiet) {
    console.log('Generating "recommended.ts"...');
  }
  await generateRecommendedTS();

  if (!quiet) {
    console.log(
      'Generating "website-root.md" and all of the individual rule docs...',
    );
  }
  await $`bun run docs`;

  if (!quiet) {
    console.log("Success!");
  }
}
