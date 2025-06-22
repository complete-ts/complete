import { Command } from "clipanion";
import { updatePackageJSONDependencies } from "complete-node";

export class UpdateCommand extends Command {
  static override paths = [["update"], ["u"]];

  static override usage = Command.Usage({
    description:
      'Invokes "npm-check-updates" to update the dependencies inside of the "package.json" file and then installs them.',
  });

  async execute(): Promise<void> {
    const hasNewDependencies = await updatePackageJSONDependencies();
    const msg = hasNewDependencies
      ? "Successfully installed new dependencies."
      : "There were no new dependency updates.";
    console.log(msg);
  }
}
