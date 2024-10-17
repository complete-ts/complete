#!/usr/bin/env node

import { intro, outro } from "@clack/prompts";
import sourceMapSupport from "source-map-support";
import { checkForWindowsTerminalBugs } from "./checkForWindowsTerminalBugs.js";
import { promptInit } from "./prompt.js";

await main();

async function main(): Promise<void> {
  sourceMapSupport.install();
  promptInit();
  await checkForWindowsTerminalBugs();

  intro("create-my-app");
  outro("You're all set!");
}
