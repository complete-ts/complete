import chalk from "chalk";
import { repeat } from "complete-common";
import type { PackageManager } from "complete-node";
import {
  $,
  copyFileOrDirectory,
  getFileNamesInDirectory,
  getPackageManagerInstallCICommand,
  getPackageManagerInstallCommand,
  isFile,
  makeDirectory,
  readFile,
  renameFile,
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
import { promptError, promptLog } from "../../prompt.js";

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
    makeDirectory(projectPath);
  }

  copyStaticFiles(projectPath);
  copyDynamicFiles(projectName, authorName, projectPath, packageManager);

  // There is no package manager lock files yet, so we have to pass "false" to this function.
  const updated = updatePackageJSONDependencies(projectPath, false, true);
  if (!updated) {
    promptError(
      'Failed to update the dependencies in the "package.json" file.',
    );
  }

  await installNodeModules(projectPath, skipInstall, packageManager);
  await formatFiles(projectPath);

  // Only make the initial commit once all of the files have been copied and formatted.
  await initGitRepository(projectPath, gitRemoteURL);

  promptLog(`Successfully created project: ${chalk.green(projectName)}`);
}

/** Copy static files, like "eslint.config.mjs", "tsconfig.json", etc. */
function copyStaticFiles(projectPath: string) {
  copyTemplateDirectoryWithoutOverwriting(TEMPLATES_STATIC_DIR, projectPath);

  // Rename "_gitattributes" to ".gitattributes". (If it is kept as ".gitattributes", then it won't
  // be committed to git.)
  const gitAttributesPath = path.join(projectPath, "_gitattributes");
  const correctGitAttributesPath = path.join(projectPath, ".gitattributes");
  renameFile(gitAttributesPath, correctGitAttributesPath);

  // Rename "_cspell.config.jsonc" to "cspell.config.jsonc". (If it is kept as
  // "cspell.config.jsonc", then local spell checking will fail.)
  const cSpellConfigPath = path.join(projectPath, "_cspell.config.jsonc");
  const correctCSpellConfigPath = path.join(projectPath, "cspell.config.jsonc");
  renameFile(cSpellConfigPath, correctCSpellConfigPath);
}

function copyTemplateDirectoryWithoutOverwriting(
  templateDirPath: string,
  projectPath: string,
) {
  const fileNames = getFileNamesInDirectory(templateDirPath);
  for (const fileName of fileNames) {
    const templateFilePath = path.join(templateDirPath, fileName);
    const destinationFilePath = path.join(projectPath, fileName);
    if (!isFile(destinationFilePath)) {
      copyFileOrDirectory(templateFilePath, destinationFilePath);
    }
  }
}

/** Copy files that need to have text replaced inside of them. */
function copyDynamicFiles(
  projectName: string,
  authorName: string | undefined,
  projectPath: string,
  packageManager: PackageManager,
) {
  // `.github/workflows/setup/action.yml`
  {
    const fileName = ACTION_YML;
    const templatePath = ACTION_YML_TEMPLATE_PATH;
    const template = readFile(templatePath);

    const installCommand = getPackageManagerInstallCICommand(packageManager);
    const actionYML = template
      .replaceAll("PACKAGE_MANAGER_NAME", packageManager)
      .replaceAll("PACKAGE_MANAGER_INSTALL_COMMAND", installCommand);

    const setupPath = path.join(projectPath, ".github", "workflows", "setup");
    makeDirectory(setupPath);
    const destinationPath = path.join(setupPath, fileName);
    writeFile(destinationPath, actionYML);
  }

  // `.gitignore`
  {
    const templatePath = path.join(
      TEMPLATES_DYNAMIC_DIR,
      "_gitignore", // Not named ".gitignore" to prevent npm from deleting it.
    );
    const template = readFile(templatePath);

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
    const nodeGitIgnore = readFile(nodeGitIgnorePath);

    // eslint-disable-next-line prefer-template
    const gitignore = gitIgnoreHeader + template + "\n" + nodeGitIgnore;

    // We need to replace the underscore with a period.
    const destinationPath = path.join(projectPath, ".gitignore");
    writeFile(destinationPath, gitignore);
  }

  // `package.json`
  {
    const templatePath = path.join(TEMPLATES_DYNAMIC_DIR, "package.json");
    const template = readFile(templatePath);

    const packageJSON = template
      .replaceAll("PROJECT_NAME", projectName)
      .replaceAll("AUTHOR_NAME", authorName ?? "unknown");

    const destinationPath = path.join(projectPath, "package.json");
    writeFile(destinationPath, packageJSON);
  }

  // `README.md`
  {
    const templatePath = path.join(TEMPLATES_DYNAMIC_DIR, "README.md");
    const template = readFile(templatePath);

    // "PROJECT-NAME" must be hyphenated, as using an underscore will break Prettier for some
    // reason.
    const command = getPackageManagerInstallCICommand(packageManager);
    const readmeMD = template
      .replaceAll("PROJECT-NAME", projectName)
      .replaceAll("PACKAGE-MANAGER-INSTALL-COMMAND", command);
    const destinationPath = path.join(projectPath, "README.md");
    writeFile(destinationPath, readmeMD);
  }

  const srcPath = path.join(projectPath, "src");
  makeDirectory(srcPath);
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
  promptLog(
    `Installing node modules with "${command}"... (This can take a long time.)`,
  );
  const $$ = $({ cwd: projectPath });
  /// const commandParts = command.split(" ");
  await $$`${packageManager} install`;
}

async function formatFiles(projectPath: string) {
  const $$ = $({ cwd: projectPath });
  await $$`prettier --write ${projectPath}`;
}
