import chalk from "chalk";
import { assertObject, repeat } from "complete-common";
import {
  $q,
  copyFileOrDirectory,
  formatWithPrettier,
  getFileNamesInDirectory,
  getPackageJSON,
  getPackageManagerInstallCICommand,
  getPackageManagerInstallCommand,
  isFile,
  makeDirectory,
  PackageManager,
  readFile,
  renameFileOrDirectory,
  updatePackageJSONDependencies,
  writeFile,
} from "complete-node";
import path from "node:path";
import {
  ACTION_YML,
  ACTION_YML_TEMPLATE_PATH,
  TEMPLATES_DYNAMIC_DIR,
  TEMPLATES_STATIC_DIR,
} from "../../constants.js";
import { initGitRepository } from "../../git.js";
import { promptError, promptLog, promptSpinnerStart } from "../../prompt.js";
import { LOCKED_DEPENDENCIES } from "./lockedDependencies.js";

export async function createProject(
  projectName: string,
  authorName: string | undefined,
  projectPath: string,
  createNewDir: boolean,
  gitRemoteURL: string | undefined,
  skipInstall: boolean,
  packageManager: PackageManager,
): Promise<void> {
  if (createNewDir) {
    await makeDirectory(projectPath);
  }

  await copyStaticFiles(projectPath);
  await copyDynamicFiles(projectName, authorName, projectPath, packageManager);
  await copyPackageManagerSpecificFiles(projectPath, packageManager);

  // There is no package manager lock files yet, so we have to pass "false" to this function.
  const updated = await updatePackageJSONDependencies(projectPath, false, true);
  if (!updated) {
    promptError(
      'Failed to update the dependencies in the "package.json" file.',
    );
  }

  // There may be one or more dependencies that should not be updated to the latest version.
  if (LOCKED_DEPENDENCIES.length > 0) {
    await revertVersionsInPackageJSON(projectPath);
    await createPackageMetadataJSON(projectPath);
  }

  await installNodeModules(projectPath, skipInstall, packageManager);
  await formatFiles(projectPath, packageManager);

  // Only make the initial commit once all of the files have been copied and formatted.
  await initGitRepository(projectPath, gitRemoteURL);

  promptLog(`Successfully created project: ${chalk.green(projectName)}`);
}

/** Copy static files, like "eslint.config.mjs", "tsconfig.json", etc. */
async function copyStaticFiles(projectPath: string) {
  await copyTemplateDirectoryWithoutOverwriting(
    TEMPLATES_STATIC_DIR,
    projectPath,
  );

  // Rename "_gitattributes" to ".gitattributes". (If it is kept as ".gitattributes", then it won't
  // be committed to git.)
  const gitAttributesPath = path.join(projectPath, "_gitattributes");
  const correctGitAttributesPath = path.join(projectPath, ".gitattributes");
  await renameFileOrDirectory(gitAttributesPath, correctGitAttributesPath);

  // Rename "_cspell.config.jsonc" to "cspell.config.jsonc". (If it is kept as
  // "cspell.config.jsonc", then local spell checking will fail.)
  const cSpellConfigPath = path.join(projectPath, "_cspell.config.jsonc");
  const correctCSpellConfigPath = path.join(projectPath, "cspell.config.jsonc");
  await renameFileOrDirectory(cSpellConfigPath, correctCSpellConfigPath);
}

async function copyTemplateDirectoryWithoutOverwriting(
  templateDirPath: string,
  projectPath: string,
) {
  const fileNames = await getFileNamesInDirectory(templateDirPath);
  await Promise.all(
    fileNames.map(async (fileName) => {
      const templateFilePath = path.join(templateDirPath, fileName);
      const destinationFilePath = path.join(projectPath, fileName);
      const file = await isFile(destinationFilePath);
      if (!file) {
        await copyFileOrDirectory(templateFilePath, destinationFilePath);
      }
    }),
  );
}

/** Copy files that need to have text replaced inside of them. */
async function copyDynamicFiles(
  projectName: string,
  authorName: string | undefined,
  projectPath: string,
  packageManager: PackageManager,
) {
  // `.github/workflows/setup/action.yml`
  {
    const fileName = ACTION_YML;
    const templatePath = ACTION_YML_TEMPLATE_PATH;
    const template = await readFile(templatePath);

    const installCommand = getPackageManagerInstallCICommand(packageManager);
    const actionYML = template
      .replaceAll("PACKAGE_MANAGER_NAME", packageManager)
      .replaceAll("PACKAGE_MANAGER_INSTALL_COMMAND", installCommand);

    const setupPath = path.join(projectPath, ".github", "workflows", "setup");
    await makeDirectory(setupPath);
    const destinationPath = path.join(setupPath, fileName);
    await writeFile(destinationPath, actionYML);
  }

  // `.gitignore`
  {
    const templatePath = path.join(
      TEMPLATES_DYNAMIC_DIR,
      "_gitignore", // Not named ".gitignore" to prevent npm from deleting it.
    );
    const template = await readFile(templatePath);

    // Prepend a header with the project name.
    let separatorLine = "# ";
    repeat(projectName.length, () => {
      separatorLine += "-";
    });
    separatorLine += "\n";
    const gitIgnoreHeader = `${separatorLine}# ${projectName}\n${separatorLine}\n`;
    const nodeGitIgnorePath = path.join(
      TEMPLATES_DYNAMIC_DIR,
      "Node.gitignore",
    );
    const nodeGitIgnore = await readFile(nodeGitIgnorePath);

    // eslint-disable-next-line prefer-template
    const gitignore = gitIgnoreHeader + template + "\n" + nodeGitIgnore;

    // We need to replace the underscore with a period.
    const destinationPath = path.join(projectPath, ".gitignore");
    await writeFile(destinationPath, gitignore);
  }

  // `package.json`
  {
    const templatePath = path.join(TEMPLATES_DYNAMIC_DIR, "package.json");
    const template = await readFile(templatePath);

    const packageJSON = template
      .replaceAll("project-name", projectName)
      .replaceAll("author-name", authorName ?? "unknown");

    const destinationPath = path.join(projectPath, "package.json");
    await writeFile(destinationPath, packageJSON);
  }

  // `README.md`
  {
    const templatePath = path.join(TEMPLATES_DYNAMIC_DIR, "README.md");
    const template = await readFile(templatePath);

    // "PROJECT-NAME" must be hyphenated, as using an underscore will break Prettier for some
    // reason.
    const command = getPackageManagerInstallCICommand(packageManager);
    const readmeMD = template
      .replaceAll("PROJECT-NAME", projectName)
      .replaceAll("PACKAGE-MANAGER-INSTALL-COMMAND", command);
    const destinationPath = path.join(projectPath, "README.md");
    await writeFile(destinationPath, readmeMD);
  }
}

async function copyPackageManagerSpecificFiles(
  projectPath: string,
  packageManager: PackageManager,
) {
  switch (packageManager) {
    case PackageManager.npm: {
      const npmrc = "save-exact=true\n";
      const npmrcPath = path.join(projectPath, ".npmrc");
      await writeFile(npmrcPath, npmrc);
      break;
    }

    // `pnpm` requires the `shamefully-hoist` option to be enabled for "complete-lint" to work
    // correctly.
    case PackageManager.pnpm: {
      const npmrc = "save-exact=true\nshamefully-hoist=true\n";
      const npmrcPath = path.join(projectPath, ".npmrc");
      await writeFile(npmrcPath, npmrc);
      break;
    }

    case PackageManager.yarn: {
      break;
    }

    case PackageManager.bun: {
      const bunfig = "[install]\nexact = true\n";
      const bunfigPath = path.join(projectPath, "bunfig.toml");
      await writeFile(bunfigPath, bunfig);

      // Additionally, we assume that if they are using the Bun package manager, they also want to
      // use the Bun runtime. First, replace "complete-tsconfig/tsconfig.node.json" with
      // "complete-tsconfig/tsconfig.bun.json".
      const tsConfigJSONPath = path.join(projectPath, "tsconfig.json");
      const tsConfigJSONScriptsPath = path.join(
        projectPath,
        "scripts",
        "tsconfig.json",
      );
      const filePathsToReplaceNodeWithBun = [
        tsConfigJSONPath,
        tsConfigJSONScriptsPath,
      ];
      await Promise.all(
        filePathsToReplaceNodeWithBun.map(async (filePath) => {
          const fileContents = await readFile(filePath);
          const newFileContents = fileContents.replaceAll("node", "bun");
          await writeFile(filePath, newFileContents);
        }),
      );

      // Second, replace "tsx" with "bun run".
      const packageJSONPath = path.join(projectPath, "package.json");
      const fileContents = await readFile(packageJSONPath);
      const newFileContents = fileContents.replaceAll("tsx", "bun run");
      await writeFile(packageJSONPath, newFileContents);

      break;
    }
  }
}

async function revertVersionsInPackageJSON(projectPath: string) {
  const packageJSONPath = path.join(projectPath, "package.json");
  const packageJSON = await getPackageJSON(packageJSONPath);
  const { devDependencies } = packageJSON;
  assertObject(
    devDependencies,
    'The "devDependencies" in the "package.json" file was not an object.',
  );
  for (const { name, version } of LOCKED_DEPENDENCIES) {
    devDependencies[name] = version;
  }
  const packageJSONText = JSON.stringify(packageJSON);
  await formatWithPrettier(packageJSONText, "json", projectPath);
  await writeFile(packageJSONPath, packageJSONText);
}

async function createPackageMetadataJSON(projectPath: string) {
  const packageMetadata = {
    devDependencies: {} as Record<string, unknown>,
  };
  for (const { name, reason } of LOCKED_DEPENDENCIES) {
    packageMetadata.devDependencies[name] = {
      "lock-version": true,
      "lock-reason": reason,
    };
  }
  const packageMetadataText = JSON.stringify(packageMetadata);
  await formatWithPrettier(packageMetadataText, "json", projectPath);
  const packageMetadataPath = path.join(projectPath, "package-metadata.json");
  await writeFile(packageMetadataPath, packageMetadataText);
}

async function installNodeModules(
  projectPath: string,
  skipInstall: boolean,
  packageManager: PackageManager,
) {
  if (skipInstall) {
    return;
  }

  const command = getPackageManagerInstallCommand(packageManager);
  const s = promptSpinnerStart(
    `Installing the project dependencies with "${command}". (This can take a long time.)`,
  );

  try {
    const $$q = $q({ cwd: projectPath });
    const commandParts = command.split(" ");
    await $$q`${commandParts}`;
    s.stop("Installed.");
  } catch {
    s.stop("Failed to install.");
    promptError("Exiting.");
  }
}

async function formatFiles(
  projectPath: string,
  packageManager: PackageManager,
) {
  const $$q = $q({ cwd: projectPath });

  // Execa does not work properly with Bun in this context. Invoking `bunx` directly fixes the
  // problem.
  await (packageManager === PackageManager.bun
    ? $$q`bunx prettier --write .`
    : $$q`prettier --write .`);
}
