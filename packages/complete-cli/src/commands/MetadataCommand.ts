import { Command, Option } from "clipanion";
import { assertObject, isObject } from "complete-common";
import { getFilePath, isFile, readFile, writeFile } from "complete-node";
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
    const packageJSONPath = await getFilePath("package.json", undefined);
    const packageRoot = path.dirname(packageJSONPath);
    const packageMetadataPath = path.join(packageRoot, "package-metadata.json");
    const packageMetadataExists = await isFile(packageMetadataPath);

    let packageMetadata: Record<string, unknown>;
    if (packageMetadataExists) {
      const packageMetadataContents = await readFile(packageMetadataPath);
      const packageMetadataUnknown = JSON.parse(
        packageMetadataContents,
      ) as unknown;
      assertObject(
        packageMetadataUnknown,
        `Failed to parse the metadata file at: ${packageMetadataPath}`,
      );
      packageMetadata = packageMetadataUnknown;
    } else {
      packageMetadata = {};
    }

    let dependencies: Record<string, unknown>;
    if (isObject(packageMetadata["dependencies"])) {
      // eslint-disable-next-line @typescript-eslint/prefer-destructuring
      dependencies = packageMetadata["dependencies"];
    } else {
      dependencies = {};
      packageMetadata["dependencies"] = dependencies;
    }

    dependencies[this.dependencyName] = {
      "lock-version": true,
      "lock-reason": this.reason ?? "",
    };

    const packageMetadataJSON = JSON.stringify(packageMetadata, undefined, 2);
    await writeFile(packageMetadataPath, packageMetadataJSON);

    const verb = packageMetadataExists ? "modified" : "created";
    console.log(`Successfully ${verb}: ${packageMetadataPath}`);
  }
}
