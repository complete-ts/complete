import { isMain } from "complete-node";
import { generateConfigs } from "./generateConfigs.js";
import { generateReadme } from "./generateReadme.js";
import { generateRules } from "./generateRules.js";

if (isMain()) {
  await generateAll();
}

export async function generateAll(quiet = false): Promise<void> {
  // Generating rules must come before configs and readme because it builds the "rules.ts" file
  // (which is parsed later on).
  if (!quiet) {
    console.log("Generating rules...");
  }
  await generateRules();

  if (!quiet) {
    console.log("Generating configs...");
  }
  await generateConfigs();

  if (!quiet) {
    console.log("Generating readme...");
  }
  await generateReadme();

  if (!quiet) {
    console.log("Success!");
  }
}
