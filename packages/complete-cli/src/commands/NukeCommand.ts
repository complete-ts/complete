import { Command } from "clipanion";
import { nukeDependencies } from "complete-node";

export class NukeCommand extends Command {
  static override paths = [["nuke"], ["n"]];

  static override usage = Command.Usage({
    description:
      'Delete the "node_modules" directory and the package lock file, then reinstall the dependencies for the project.',
  });

  // eslint-disable-next-line @typescript-eslint/require-await
  async execute(): Promise<void> {
    nukeDependencies();
    console.log("Successfully reinstalled dependencies from npm.");
  }
}
