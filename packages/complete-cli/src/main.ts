#!/usr/bin/env node

import { intro, outro } from "@clack/prompts";
import chalk from "chalk";
import sourceMapSupport from "source-map-support";
import { checkForWindowsTerminalBugs } from "./checkForWindowsTerminalBugs.js";
import { promptInit } from "./prompt.js";

await main();

async function main(): Promise<void> {
  sourceMapSupport.install();
  promptInit();
  await checkForWindowsTerminalBugs();

  intro(chalk.inverse(""));
  outro("You're all set!");
}
