import { Command, Option } from "clipanion";
import { getPackageRoot, writeFileAsync } from "complete-node";
import path from "node:path";

export class MetadataCommand extends Command {
  static override paths = [["metadata"], ["m"]];

  // The first positional argument.
  dependencyName = Option.String({
    required: true,
  });

  reason = Option.String({
    required: false,
  });

  static override usage = Command.Usage({
    description:
      'Creates a "package-metadata.json" file to document locked dependencies. (The "update" command will respect the contents of this file.)',
  });

  async execute(): Promise<void> {
    const packageMetadata = {
      dependencies: {} as Record<string, unknown>,
    };

    packageMetadata.dependencies[this.dependencyName] = {
      "lock-version": true,
      "lock-reason": this.reason ?? "",
    };

    const packageRoot = await getPackageRoot();
    const packageMetadataPath = path.join(packageRoot, "package-metadata.json");
    const packageMetadataJSON = JSON.stringify(packageMetadata, undefined, 2);
    await writeFileAsync(packageMetadataPath, packageMetadataJSON);

    console.log(`Successfully created: ${packageMetadataPath}`);
  }
}
