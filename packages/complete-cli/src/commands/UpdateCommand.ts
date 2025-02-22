import { Command } from "clipanion";
import { updatePackageJSONDependencies } from "complete-node";

export class UpdateCommand extends Command {
  static override paths = [["update"], ["u"]];

  static override usage = Command.Usage({
    description:
      'Invoke "npm-check-updates" to update the dependencies inside of the "package.json" file and then install them.',
  });

  async execute(): Promise<void> {
    const hasNewDependencies = await updatePackageJSONDependencies();
    const msg = hasNewDependencies
      ? "Successfully installed new Node.js dependencies."
      : "There were no new dependency updates from npm.";
    console.log(msg);
  }
}
