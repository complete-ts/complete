#!/usr/bin/env node

import { Builtins, Cli } from "clipanion";
import sourceMapSupport from "source-map-support";
import { CheckCommand } from "./commands/CheckCommand.js";
import { InitCommand } from "./commands/InitCommand.js";
import { MetadataCommand } from "./commands/MetadataCommand.js";
import { NukeCommand } from "./commands/NukeCommand.js";
import { PublishCommand } from "./commands/PublishCommand.js";
import { UpdateCommand } from "./commands/UpdateCommand.js";
import { PROJECT_NAME, PROJECT_VERSION } from "./constants.js";

await main();

async function main() {
  // First, enable source map support so that if run-time errors occur, we can see the line of
  // TypeScript code instead of the line of compiled JavaScript code.
  sourceMapSupport.install();

  const [_node, _app, ...args] = process.argv;

  const cli = new Cli({
    binaryLabel: PROJECT_NAME,
    binaryName: PROJECT_NAME,
    binaryVersion: PROJECT_VERSION,
  });

  cli.register(CheckCommand);
  cli.register(InitCommand);
  cli.register(MetadataCommand);
  cli.register(NukeCommand);
  cli.register(PublishCommand);
  cli.register(UpdateCommand);

  cli.register(Builtins.HelpCommand);
  cli.register(Builtins.VersionCommand);

  await cli.runExit(args);
}
