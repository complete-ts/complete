import { Command } from "clipanion";
import { nukeDependencies } from "complete-node";

export class NukeCommand extends Command {
  static override paths = [["nuke"], ["n"]];

  static override usage = Command.Usage({
    description:
      'Deletes the "node_modules" directory and the package lock file, then reinstalls the dependencies for the project.',
  });

  async execute(): Promise<void> {
    await nukeDependencies();
    console.log("Successfully reinstalled dependencies from npm.");
  }
}
