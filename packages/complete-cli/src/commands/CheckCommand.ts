import chalk from "chalk";
import { Command, Option } from "clipanion";
import { ReadonlySet } from "complete-common";
import {
  $s,
  deleteFileOrDirectory,
  fatalError,
  isDirectory,
  isFile,
  readFile,
  writeFile,
} from "complete-node";
import klawSync from "klaw-sync";
import path from "node:path";
import {
  ACTION_YML,
  ACTION_YML_TEMPLATE_PATH,
  CWD,
  TEMPLATES_DYNAMIC_DIR,
  TEMPLATES_STATIC_DIR,
} from "../constants.js";
import { getTruncatedText } from "./check/getTruncatedText.js";

const URL_PREFIX =
  "https://raw.githubusercontent.com/complete-ts/complete/main/packages/complete-cli/file-templates";

export class CheckCommand extends Command {
  static override paths = [["check"], ["c"]];

  ignore = Option.String("-i,--ignore", {
    description: "Comma separated list of file names to ignore.",
  });

  verbose = Option.Boolean("-v,--verbose", false, {
    description: "Enable verbose output.",
  });

  static override usage = Command.Usage({
    description:
      "Check the template files of the current TypeScript project to see if they are up to date.",
  });

  // eslint-disable-next-line @typescript-eslint/require-await
  async execute(): Promise<void> {
    let oneOrMoreErrors = false;
    const ignore = this.ignore ?? "";
    const ignoreFileNames = ignore.split(",");
    const ignoreFileNamesSet = new ReadonlySet(ignoreFileNames);

    // First, check the static files.
    if (
      checkTemplateDirectory(
        TEMPLATES_STATIC_DIR,
        ignoreFileNamesSet,
        this.verbose,
      )
    ) {
      oneOrMoreErrors = true;
    }

    // Second, check dynamic files that require specific logic.
    if (checkIndividualFiles(ignoreFileNamesSet, this.verbose)) {
      oneOrMoreErrors = true;
    }

    if (oneOrMoreErrors) {
      fatalError("The check command failed.");
    }
  }
}

function checkTemplateDirectory(
  templateDirectory: string,
  ignoreFileNamesSet: ReadonlySet<string>,
  verbose: boolean,
): boolean {
  let oneOrMoreErrors = false;

  for (const klawItem of klawSync(templateDirectory)) {
    const templateFilePath = klawItem.path;

    if (isDirectory(templateFilePath)) {
      continue;
    }

    const originalFileName = path.basename(templateFilePath);
    if (originalFileName === "main.ts") {
      continue;
    }

    const relativeTemplateFilePath = path.relative(
      templateDirectory,
      templateFilePath,
    );
    const templateFileName = path.basename(relativeTemplateFilePath);

    let projectFilePath = path.join(CWD, relativeTemplateFilePath);
    switch (templateFileName) {
      case "_cspell.config.jsonc": {
        projectFilePath = path.join(
          projectFilePath,
          "..",
          "cspell.config.jsonc",
        );
        break;
      }

      case "_gitattributes": {
        projectFilePath = path.join(projectFilePath, "..", ".gitattributes");
        break;
      }

      default: {
        break;
      }
    }

    const projectFileName = path.basename(projectFilePath);
    if (ignoreFileNamesSet.has(projectFileName)) {
      continue;
    }

    if (!compareTextFiles(projectFilePath, templateFilePath, verbose)) {
      oneOrMoreErrors = true;
    }
  }

  return oneOrMoreErrors;
}

function checkIndividualFiles(
  ignoreFileNamesSet: ReadonlySet<string>,
  verbose: boolean,
) {
  let oneOrMoreErrors = false;

  if (!ignoreFileNamesSet.has(ACTION_YML)) {
    const templateFilePath = ACTION_YML_TEMPLATE_PATH;
    const relativeTemplateFilePath = path.relative(
      TEMPLATES_DYNAMIC_DIR,
      templateFilePath,
    );
    const projectFilePath = path.join(CWD, relativeTemplateFilePath);
    if (!compareTextFiles(projectFilePath, templateFilePath, verbose)) {
      oneOrMoreErrors = true;
    }
  }

  return oneOrMoreErrors;
}

/** @returns Whether the project file is valid in reference to the template file. */
function compareTextFiles(
  projectFilePath: string,
  templateFilePath: string,
  verbose: boolean,
): boolean {
  if (!isFile(projectFilePath)) {
    console.log(`Failed to find the following file: ${projectFilePath}`);
    printTemplateLocation(templateFilePath);

    return false;
  }

  const projectFileObject = getTruncatedFileText(
    projectFilePath,
    new Set(),
    new Set(),
  );

  const templateFileObject = getTruncatedFileText(
    templateFilePath,
    projectFileObject.ignoreLines,
    projectFileObject.linesBeforeIgnore,
  );

  if (projectFileObject.text === templateFileObject.text) {
    return true;
  }

  console.log(
    `The contents of the following file do not match: ${chalk.red(
      projectFilePath,
    )}`,
  );
  printTemplateLocation(templateFilePath);

  if (verbose) {
    const originalTemplateFile = readFile(templateFilePath);
    const originalProjectFile = readFile(projectFilePath);

    console.log("--- Original template file: ---\n");
    console.log(originalTemplateFile);
    console.log();
    console.log("--- Original project file: ---\n");
    console.log(originalProjectFile);
    console.log();
    console.log("--- Parsed template file: ---\n");
    console.log(templateFileObject.text);
    console.log();
    console.log("--- Parsed project file: ---\n");
    console.log(projectFileObject.text);
    console.log();
  }

  const tempProjectFilePath = path.join(CWD, "tempProjectFile.txt");
  const tempTemplateFilePath = path.join(CWD, "tempTemplateFile.txt");

  writeFile(tempProjectFilePath, projectFileObject.text);
  writeFile(tempTemplateFilePath, templateFileObject.text);

  $s`diff ${tempProjectFilePath} ${tempTemplateFilePath} --ignore-blank-lines`;

  deleteFileOrDirectory(tempProjectFilePath);
  deleteFileOrDirectory(tempTemplateFilePath);

  return false;
}

function getTruncatedFileText(
  filePath: string,
  ignoreLines: ReadonlySet<string>,
  linesBeforeIgnore: ReadonlySet<string>,
) {
  const fileName = path.basename(filePath);
  const fileContents = readFile(filePath);

  return getTruncatedText(
    fileName,
    fileContents,
    ignoreLines,
    linesBeforeIgnore,
  );
}

function printTemplateLocation(templateFilePath: string) {
  const unixPath = templateFilePath.split(path.sep).join(path.posix.sep);
  const match = unixPath.match(/.+\/file-templates\/(?<urlSuffix>.+)/);
  if (match === null || match.groups === undefined) {
    fatalError(`Failed to parse the template file path: ${templateFilePath}`);
  }
  const { urlSuffix } = match.groups;

  console.log(
    `You can find the template at: ${chalk.green(
      `${URL_PREFIX}/${urlSuffix}`,
    )}\n`,
  );
}
