import { Command, Option } from "clipanion";
import path from "node:path";
import { promptGitHubRepoOrGitRemoteURL } from "../git.js";
import { promptEnd, promptStart } from "../prompt.js";
import { checkIfProjectPathExists } from "./init/checkIfProjectPathExists.js";
import { createProject } from "./init/createProject.js";
import { getAuthorName } from "./init/getAuthorName.js";
import { getProjectPath } from "./init/getProjectPath.js";
import { getPackageManagerUsedForNewProject } from "./init/packageManager.js";
import { vsCodeInit } from "./init/vsCodeInit.js";

export class InitCommand extends Command {
  static override paths = [["init"], ["i"]];

  // The first positional argument.
  name = Option.String({
    required: false,
  });

  yes = Option.Boolean("-y,--yes", false, {
    description:
      'Answer yes to every dialog option, similar to how "npm init --yes" works.',
  });

  useCurrentDirectory = Option.Boolean("--use-current-directory", false, {
    description: "Use the current directory as the root for the project.",
  });

  customDirectory = Option.String("--custom-directory", {
    description:
      "Initialize the project into the specified directory (instead of creating a new one based on the name or using the current working directory).",
  });

  vsCode = Option.Boolean("--vscode", false, {
    description: "Open the project in VSCode after initialization.",
  });

  npm = Option.Boolean("--npm", false, {
    description: "Use npm as the package manager.",
  });

  yarn = Option.Boolean("--yarn", false, {
    description: "Use yarn as the package manager.",
  });

  pnpm = Option.Boolean("--pnpm", false, {
    description: "Use pnpm as the package manager.",
  });

  skipGit = Option.Boolean("--skip-git", false, {
    description: "Do not initialize Git.",
  });

  skipInstall = Option.Boolean("--skip-install", false, {
    description:
      "Do not automatically install the dependencies after initializing the project.",
  });

  forceName = Option.Boolean("-f,--force-name", false, {
    description: "Allow project names that are normally illegal.",
  });

  static override usage = Command.Usage({
    description: "Initialize a new TypeScript project.",
  });

  async execute(): Promise<void> {
    promptStart();

    const packageManager = getPackageManagerUsedForNewProject(this);

    // Prompt the end-user for some information (and validate it as we go).
    const { projectPath, createNewDir } = await getProjectPath(
      this.name,
      this.useCurrentDirectory,
      this.customDirectory,
      this.yes,
      this.forceName,
    );
    await checkIfProjectPathExists(projectPath, this.yes);

    const projectName = path.basename(projectPath);
    const authorName = await getAuthorName();
    const gitRemoteURL = await promptGitHubRepoOrGitRemoteURL(
      projectName,
      this.yes,
      this.skipGit,
    );

    // Now that we have asked the user all of the questions we need, we can create the project.
    await createProject(
      projectName,
      authorName,
      projectPath,
      createNewDir,
      gitRemoteURL,
      this.skipInstall,
      packageManager,
    );

    await vsCodeInit(projectPath, this.vsCode, this.yes);

    promptEnd("Initialization completed.");
  }
}
