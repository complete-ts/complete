import { $, commandExists, getJSONC, isFile } from "complete-node";
import path from "node:path";
import { getInputYesNo, promptError, promptLog } from "../../prompt.js";

const VS_CODE_COMMANDS = [
  "code",
  "codium",
  "code-oss",
  "code-insiders",
] as const;

export async function vsCodeInit(
  projectPath: string,
  vscode: boolean,
  yes: boolean,
): Promise<void> {
  const VSCodeCommand = await getVSCodeCommand();
  if (VSCodeCommand === undefined) {
    promptLog(
      'VSCode does not seem to be installed. (The "code" command is not in the path.) Skipping VSCode-related things.',
    );
    return;
  }

  await installVSCodeExtensions(projectPath, VSCodeCommand);
  await promptVSCode(projectPath, VSCodeCommand, vscode, yes);
}

async function getVSCodeCommand(): Promise<
  (typeof VS_CODE_COMMANDS)[number] | undefined
> {
  const commandCheckPromises = VS_CODE_COMMANDS.map((command) => ({
    command,
    existsPromise: commandExists(command),
  }));

  const commandChecks = await Promise.all(
    commandCheckPromises.map(async (check) => ({
      command: check.command,
      exists: await check.existsPromise,
    })),
  );

  const existingCommands = commandChecks
    .filter((check) => check.exists)
    .map((check) => check.command);

  return existingCommands[0];
}

async function installVSCodeExtensions(
  projectPath: string,
  vsCodeCommand: string,
) {
  // Installing extensions from inside WSL on Windows will result in the VSCode process never
  // exiting for some reason. Thus, skip this step on Linux. (Linux users will probably be smart
  // enough to install the extensions on their own.)
  if (process.platform === "linux") {
    return;
  }

  const extensions = await getExtensionsFromJSON(projectPath);
  for (const extensionName of extensions) {
    // eslint-disable-next-line no-await-in-loop
    await $`${vsCodeCommand} --install-extension ${extensionName}`;
  }
}

async function getExtensionsFromJSON(
  projectPath: string,
): Promise<readonly string[]> {
  const extensionsJSONPath = path.join(
    projectPath,
    ".vscode",
    "extensions.json",
  );

  if (!isFile(extensionsJSONPath)) {
    return [];
  }

  const extensionsJSON = await getJSONC(extensionsJSONPath);

  const { recommendations } = extensionsJSON;
  if (!Array.isArray(recommendations)) {
    promptError(
      'The "recommendations" field in the "extensions.json" file is not an array.',
    );
  }

  for (const recommendation of recommendations) {
    if (typeof recommendation !== "string") {
      promptError(
        'One of the entries in the "recommendations" field in the "extensions.json" file is not a string.',
      );
    }
  }

  return recommendations as string[];
}

async function promptVSCode(
  projectPath: string,
  VSCodeCommand: string,
  vscode: boolean,
  yes: boolean,
): Promise<void> {
  if (vscode) {
    // They supplied the "--vscode" command-line flag, so there is no need to prompt the user.
    await openVSCode(projectPath, VSCodeCommand);
    return;
  }

  if (yes) {
    // They supplied the "--yes" command-line flag, which implies that they want a silent install,
    // so skip opening VSCode.
    return;
  }

  // The VSCode command does not work properly inside WSL on Windows.
  if (process.platform === "linux") {
    return;
  }

  const shouldOpenVSCode = await getInputYesNo(
    "Do you want to open your new project in VSCode now?",
  );
  if (shouldOpenVSCode) {
    await openVSCode(projectPath, VSCodeCommand);
  }
}

async function openVSCode(projectPath: string, VSCodeCommand: string) {
  await $`${VSCodeCommand} ${projectPath}`;
}
