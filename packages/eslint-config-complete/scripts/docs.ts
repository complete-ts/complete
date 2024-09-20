// This script also checks for missing rules from all of the ESLint plugins.

import ESLintJS from "@eslint/js";
import type { FlatConfig } from "@typescript-eslint/utils/ts-eslint";
import type { ReadonlyRecord } from "complete-common";
import {
  assertDefined,
  isArray,
  isObject,
  kebabCaseToCamelCase,
} from "complete-common";
import {
  echo,
  isMain,
  readFile,
  setMarkdownContentInsideHTMLMarker,
} from "complete-node";
import type { Linter } from "eslint";
import ESLintConfigPrettier from "eslint-config-prettier";
import ESLintPluginImportX from "eslint-plugin-import-x";
import ESLintPluginJSDoc from "eslint-plugin-jsdoc";
import ESLintPluginN from "eslint-plugin-n";
import ESLintPluginUnicorn from "eslint-plugin-unicorn";
import extractComments from "extract-comments";
import path from "node:path";
import url from "node:url";
import tseslint from "typescript-eslint";

const FAIL_ON_MISSING_RULES = true as boolean;

const PACKAGE_ROOT = path.join(import.meta.dirname, "..");
const PACKAGE_NAME = path.basename(PACKAGE_ROOT);
const BASE_CONFIGS_PATH = path.join(PACKAGE_ROOT, "src", "base");
const README_PATH = path.join(PACKAGE_ROOT, "website-root.md");

// -------------------------------------------------------------------------------------------------

/** https://github.com/eslint/eslint/blob/main/packages/js/src/configs/eslint-recommended.js */
const ESLINT_RECOMMENDED_RULES_SET: ReadonlySet<string> = new Set(
  Object.keys(ESLintJS.configs.recommended.rules),
);

/**
 * We only need the rule lists for the 6 main configs.
 *
 * @see
 * https://github.com/typescript-eslint/typescript-eslint/tree/main/packages/eslint-plugin/src/configs
 */
const TYPESCRIPT_ESLINT_RULES = {
  recommended: getTypeScriptESLintConfigRules("recommended"),
  "recommended-type-checked": getTypeScriptESLintConfigRules(
    "recommended-type-checked",
  ),
  strict: getTypeScriptESLintConfigRules("strict"),
  "strict-type-checked": getTypeScriptESLintConfigRules("strict-type-checked"),
  stylistic: getTypeScriptESLintConfigRules("stylistic"),
  "stylistic-type-checked": getTypeScriptESLintConfigRules(
    "stylistic-type-checked",
  ),
} as const;

/**
 * We only need the rule sets for the 6 main configs.
 *
 * @see
 * https://github.com/typescript-eslint/typescript-eslint/tree/main/packages/eslint-plugin/src/configs
 */
const TYPESCRIPT_ESLINT_RULES_SET = {
  recommended: new Set(TYPESCRIPT_ESLINT_RULES.recommended),
  "recommended-type-checked": new Set(
    TYPESCRIPT_ESLINT_RULES["recommended-type-checked"],
  ),
  strict: new Set(TYPESCRIPT_ESLINT_RULES.strict),
  "strict-type-checked": new Set(
    TYPESCRIPT_ESLINT_RULES["strict-type-checked"],
  ),
  stylistic: new Set(TYPESCRIPT_ESLINT_RULES.stylistic),
  "stylistic-type-checked": new Set(
    TYPESCRIPT_ESLINT_RULES["stylistic-type-checked"],
  ),
} as const;

/** https://github.com/prettier/eslint-config-prettier/blob/main/index.js */
const ESLINT_CONFIG_PRETTIER_RULES_SET: ReadonlySet<string> = new Set(
  Object.keys(ESLintConfigPrettier.rules),
);

function getTypeScriptESLintConfigRules(configName: string): readonly string[] {
  const configNameCamelCase = kebabCaseToCamelCase(configName);
  const configKey = configNameCamelCase as keyof typeof tseslint.configs;
  const configArray = tseslint.configs[configKey] as
    | FlatConfig.Config[]
    | undefined;
  assertDefined(
    configArray,
    `Failed to parse the "typescript-eslint/${configName}" config.`,
  );

  const rulesList: string[] = [];

  for (const config of configArray) {
    const { rules } = config;
    if (rules === undefined) {
      continue;
    }

    for (const [key, value] of Object.entries(rules)) {
      if (value === "warn" || value === "error") {
        rulesList.push(key);
      }
    }
  }

  return rulesList;
}

const IMPORT_RECOMMENDED_RULES_SET: ReadonlySet<string> = new Set(
  Object.keys(ESLintPluginImportX.configs.recommended.rules),
);

assertDefined(
  ESLintPluginJSDoc.configs.recommended.rules,
  "Failed to parse the rules from the following plugin: eslint-plugin-jsdoc",
);
const JSDOC_RECOMMENDED_RULES_SET: ReadonlySet<string> = new Set(
  Object.keys(ESLintPluginJSDoc.configs.recommended.rules),
);

assertDefined(
  ESLintPluginN.configs.recommended.rules,
  "Failed to parse the rules from the following plugin: eslint-plugin-n",
);
const N_RECOMMENDED_RULES_SET: ReadonlySet<string> = new Set(
  Object.keys(ESLintPluginN.configs.recommended.rules),
);

// -------------------------------------------------------------------------------------------------

type ParentConfig =
  | "eslint/recommended"
  | "@typescript-eslint/eslint-recommended"
  | "@typescript-eslint/recommended-type-checked"
  | "@typescript-eslint/recommended"
  | "@typescript-eslint/strict-type-checked"
  | "@typescript-eslint/strict"
  | "@typescript-eslint/stylistic"
  | "@typescript-eslint/stylistic-type-checked"
  | "import-x/recommended"
  | "jsdoc/recommended"
  | "n/recommended"
  | "unicorn/recommended"
  | "eslint-config-prettier";

const PARENT_CONFIG_LINKS = {
  "eslint/recommended":
    "https://github.com/eslint/eslint/blob/main/packages/js/src/configs/eslint-recommended.js",
  "@typescript-eslint/eslint-recommended":
    "https://github.com/typescript-eslint/typescript-eslint/blob/main/packages/eslint-plugin/src/configs/eslint-recommended.ts",
  "@typescript-eslint/recommended-type-checked":
    "https://github.com/typescript-eslint/typescript-eslint/blob/main/packages/eslint-plugin/src/configs/recommended-type-checked.ts",
  "@typescript-eslint/recommended":
    "https://github.com/typescript-eslint/typescript-eslint/blob/main/packages/eslint-plugin/src/configs/recommended.ts",
  "@typescript-eslint/strict-type-checked":
    "https://github.com/typescript-eslint/typescript-eslint/blob/main/packages/eslint-plugin/src/configs/strict-type-checked.ts",
  "@typescript-eslint/strict":
    "https://github.com/typescript-eslint/typescript-eslint/blob/main/packages/eslint-plugin/src/configs/strict.ts",
  "@typescript-eslint/stylistic-type-checked":
    "https://github.com/typescript-eslint/typescript-eslint/blob/main/packages/eslint-plugin/src/configs/stylistic-type-checked.ts",
  "@typescript-eslint/stylistic":
    "https://github.com/typescript-eslint/typescript-eslint/blob/main/packages/eslint-plugin/src/configs/stylistic.ts",
  "import-x/recommended":
    "https://github.com/un-ts/eslint-plugin-import-x/blob/master/src/config/recommended.ts",
  "jsdoc/recommended":
    "https://github.com/gajus/eslint-plugin-jsdoc/blob/main/src/index.js",
  "n/recommended":
    "https://github.com/eslint-community/eslint-plugin-n/blob/master/lib/configs/_commons.js",
  "unicorn/recommended":
    "https://github.com/sindresorhus/eslint-plugin-unicorn/blob/main/configs/recommended.js",
  "eslint-config-prettier":
    "https://github.com/prettier/eslint-config-prettier/blob/main/index.js",
} as const satisfies Record<ParentConfig, string>;

// -------------------------------------------------------------------------------------------------

if (isMain()) {
  await setReadmeRules(false);
}

export async function setReadmeRules(quiet: boolean): Promise<void> {
  let rulesTable = "";

  rulesTable += await getMarkdownRuleSection(
    "eslint",
    "Core ESLint Rules",
    "https://eslint.org/docs/latest/rules/",
    "https://eslint.org/docs/latest/rules/__RULE_NAME__",
    ESLintJS,
  );

  rulesTable += await getMarkdownRuleSection(
    "typescript-eslint",
    "`@typescript-eslint` Rules",
    "https://typescript-eslint.io/rules/",
    "https://typescript-eslint.io/rules/__RULE_NAME__/",
    tseslint,
  );

  rulesTable += await getMarkdownRuleSection(
    "import-x",
    getPluginHeaderTitle("import-x"),
    "https://github.com/un-ts/eslint-plugin-import-x",
    "https://github.com/un-ts/eslint-plugin-import-x/blob/master/docs/rules/__RULE_NAME__.md",
    ESLintPluginImportX,
  );

  rulesTable += await getMarkdownRuleSection(
    "jsdoc",
    getPluginHeaderTitle("jsdoc"),
    "https://github.com/gajus/eslint-plugin-jsdoc",
    "https://github.com/gajus/eslint-plugin-jsdoc/blob/main/docs/rules/__RULE_NAME__.md",
    ESLintPluginJSDoc,
  );

  rulesTable += await getMarkdownRuleSection(
    "n",
    getPluginHeaderTitle("n"),
    "https://github.com/eslint-community/eslint-plugin-n",
    "https://github.com/eslint-community/eslint-plugin-n/blob/master/docs/rules/__RULE_NAME__.md",
    ESLintPluginN,
  );

  rulesTable += await getMarkdownRuleSection(
    "unicorn",
    getPluginHeaderTitle("unicorn"),
    "https://github.com/sindresorhus/eslint-plugin-unicorn",
    "https://github.com/sindresorhus/eslint-plugin-unicorn/blob/main/docs/rules/__RULE_NAME__.md",
    ESLintPluginUnicorn,
  );

  await setMarkdownContentInsideHTMLMarker(
    README_PATH,
    rulesTable,
    "RULES_TABLE",
    PACKAGE_ROOT,
  );

  if (!quiet) {
    echo(`Successfully filled: ${README_PATH}`);
  }
}

function getPluginHeaderTitle(pluginName: string): string {
  return `\`eslint-plugin-${pluginName}\` Rules`;
}

async function getMarkdownRuleSection(
  configName: string,
  headerTitle: string,
  pluginURL: string,
  ruleURL: string,
  upstreamImport: unknown,
): Promise<string> {
  let markdownOutput = getMarkdownHeader(headerTitle, pluginURL);

  const baseConfigFileName = `base-${configName}.js`;
  const baseConfigPath = path.join(BASE_CONFIGS_PATH, baseConfigFileName);
  const baseConfigURL = url.pathToFileURL(baseConfigPath).toString();
  const baseConfig = (await import(baseConfigURL)) as unknown;

  if (!isObject(baseConfig)) {
    throw new Error(`Failed to parse the base config: ${baseConfigPath}`);
  }

  const firstExport = Object.values(baseConfig)[0];
  if (!isArray(firstExport)) {
    throw new Error(
      `Failed to parse the base config first export: ${baseConfigPath}`,
    );
  }

  const firstConfig = firstExport[0];
  if (!isObject(firstConfig)) {
    throw new Error(
      `Failed to parse the base config first config: ${baseConfigPath}`,
    );
  }

  const { rules } = firstConfig;
  if (!isObject(rules)) {
    throw new Error(`Failed to parse the base rules in: ${baseConfigPath}`);
  }

  const baseRules = rules as Record<string, Linter.RuleEntry>;
  auditBaseConfigRules(configName, upstreamImport, baseRules);

  const alphabeticalRuleNames = Object.keys(baseRules).sort();
  for (const ruleName of alphabeticalRuleNames) {
    const rule = baseRules[ruleName];
    assertDefined(rule, `Failed to find base rule: ${ruleName}`);

    const baseConfigText = readFile(baseConfigPath);

    markdownOutput += getMarkdownTableRow(
      ruleName,
      rule,
      ruleURL,
      baseConfigText,
      baseConfigFileName,
    );
  }

  return markdownOutput;
}

/**
 * Audit the base config to ensure that we have an entry for each rule corresponding to the upstream
 * code.
 */
function auditBaseConfigRules(
  configName: string,
  upstreamImport: unknown,
  baseRules: ReadonlyRecord<string, Linter.RuleEntry>,
) {
  if (upstreamImport === undefined) {
    return;
  }

  const allRules = getAllRulesFromImport(configName, upstreamImport);
  const allRuleNames = Object.keys(allRules);

  for (const ruleName of allRuleNames) {
    // Some TSESLint configs turn off core ESLint rules.
    if (
      configName === "typescript-eslint" &&
      !ruleName.startsWith("@typescript-eslint/")
    ) {
      continue;
    }

    const fullRuleName =
      configName === "eslint" || configName === "typescript-eslint"
        ? ruleName
        : `${configName}/${ruleName}`;

    const rule = baseRules[fullRuleName];
    if (rule === undefined) {
      const msg = `Failed to find a rule in the base config from upstream config "${configName}": ${fullRuleName}`;
      if (FAIL_ON_MISSING_RULES) {
        throw new Error(msg);
      } else {
        console.warn(msg);
      }
    }
  }
}

function getAllRulesFromImport(
  configName: string,
  upstreamImport: unknown,
): ReadonlyRecord<string, unknown> {
  // The core ESLint rules are a special case.
  if (configName === "eslint") {
    return getAllRulesFromCoreESLintConfig(configName, upstreamImport);
  }

  // The "typescript-eslint" plugin is a special case (since it uses the flat config).
  if (configName === "typescript-eslint") {
    return getAllRulesFromFlatConfig(configName, upstreamImport);
  }

  return getAllRulesFromOldConfig(configName, upstreamImport);
}

function getAllRulesFromCoreESLintConfig(
  configName: string,
  upstreamImport: unknown,
): ReadonlyRecord<string, unknown> {
  if (!isObject(upstreamImport)) {
    throw new Error(`Failed to parse the import for: ${configName}`);
  }

  const { configs } = upstreamImport;
  if (!isObject(configs)) {
    throw new Error(`Failed to parse the configs for: ${configName}`);
  }

  const { all } = configs;
  if (!isObject(all)) {
    throw new Error(`Failed to parse the "all" config for: ${configName}`);
  }

  const { rules } = all;
  if (!isObject(rules)) {
    throw new Error(
      `Failed to parse the "all" config rules for: ${configName}`,
    );
  }

  return rules;
}

function getAllRulesFromFlatConfig(
  configName: string,
  upstreamImport: unknown,
): ReadonlyRecord<string, unknown> {
  if (!isObject(upstreamImport)) {
    throw new Error(`Failed to parse the import for: ${configName}`);
  }

  const { configs } = upstreamImport;
  if (!isObject(configs)) {
    throw new Error(`Failed to parse the configs for: ${configName}`);
  }

  const { all } = configs;
  if (!isArray(all)) {
    throw new Error(`Failed to parse the "all" config for: ${configName}`);
  }

  for (const section of all) {
    if (!isObject(section)) {
      throw new Error(
        `Failed to parse one of the sections of the "all" config for: ${configName}`,
      );
    }

    const { name } = section;
    if (name !== "typescript-eslint/all") {
      continue;
    }

    const { rules } = section;
    if (!isObject(rules)) {
      throw new Error(
        'Failed to parse the rules from the "typescript-eslint/all" section.',
      );
    }

    return rules;
  }

  throw new Error(
    'Failed to find the section containing "typescript-eslint/all".',
  );
}

function getAllRulesFromOldConfig(
  configName: string,
  upstreamImport: unknown,
): ReadonlyRecord<string, unknown> {
  if (!isObject(upstreamImport)) {
    throw new Error(`Failed to parse the import for: ${configName}`);
  }

  const { rules } = upstreamImport;
  if (!isObject(rules)) {
    throw new Error(`Failed to parse the rules for: ${configName}`);
  }

  return rules;
}

function getMarkdownHeader(headerTitle: string, headerLink: string): string {
  return `
### [${headerTitle}](${headerLink})

| Rule Name | Enabled | Parent Configs | Notes | Source File
| --------- | ------- | -------------- | ----- | -----------
`;
}

function getRuleEnabled(ruleName: string, rule: Linter.RuleEntry): boolean {
  const severity = getRuleSeverity(ruleName, rule);

  if (severity !== "error" && severity !== "warn" && severity !== "off") {
    throw new Error(
      `Unknown value of "${severity}" when parsing rule: ${ruleName}`,
    );
  }

  return severity !== "off";
}

function getRuleSeverity(ruleName: string, rule: Linter.RuleEntry): string {
  if (typeof rule === "string") {
    return rule;
  }

  if (isArray(rule)) {
    const firstElement = rule[0];
    if (typeof firstElement !== "string") {
      throw new TypeError(
        `Failed to parse the first element of rule: ${ruleName}`,
      );
    }

    return firstElement;
  }

  throw new Error(`Failed to parse the type of rule: ${ruleName}`);
}

function getParentConfigsLinks(ruleName: string): string {
  const parentConfigs = getParentConfigs(ruleName);

  if (parentConfigs.length === 0) {
    return "";
  }

  const parentConfigLinks = parentConfigs.map(
    (parentConfig) =>
      `[\`${parentConfig}\`](${PARENT_CONFIG_LINKS[parentConfig]})`,
  );

  return `<ul><li>${parentConfigLinks.join("</li><li>")}</li></ul>`;
}

function getParentConfigs(ruleName: string): readonly ParentConfig[] {
  const parentConfigs: ParentConfig[] = [];

  if (ESLINT_RECOMMENDED_RULES_SET.has(ruleName)) {
    parentConfigs.push("eslint/recommended");
  }

  // -----------------------------------------------------------------------------------------------

  if (
    TYPESCRIPT_ESLINT_RULES_SET["recommended-type-checked"].has(ruleName) &&
    !TYPESCRIPT_ESLINT_RULES_SET.recommended.has(ruleName)
  ) {
    parentConfigs.push("@typescript-eslint/recommended-type-checked");
  }

  if (TYPESCRIPT_ESLINT_RULES_SET.recommended.has(ruleName)) {
    parentConfigs.push("@typescript-eslint/recommended");
  }

  if (
    TYPESCRIPT_ESLINT_RULES_SET["strict-type-checked"].has(ruleName) &&
    !TYPESCRIPT_ESLINT_RULES_SET.strict.has(ruleName) &&
    !TYPESCRIPT_ESLINT_RULES_SET["recommended-type-checked"].has(ruleName)
  ) {
    parentConfigs.push("@typescript-eslint/strict-type-checked");
  }

  if (
    TYPESCRIPT_ESLINT_RULES_SET.strict.has(ruleName) &&
    !TYPESCRIPT_ESLINT_RULES_SET.recommended.has(ruleName)
  ) {
    parentConfigs.push("@typescript-eslint/strict");
  }

  if (
    TYPESCRIPT_ESLINT_RULES_SET["stylistic-type-checked"].has(ruleName) &&
    !TYPESCRIPT_ESLINT_RULES_SET.stylistic.has(ruleName)
  ) {
    parentConfigs.push("@typescript-eslint/stylistic-type-checked");
  }

  if (TYPESCRIPT_ESLINT_RULES_SET.stylistic.has(ruleName)) {
    parentConfigs.push("@typescript-eslint/stylistic");
  }

  // -----------------------------------------------------------------------------------------------

  if (IMPORT_RECOMMENDED_RULES_SET.has(ruleName)) {
    parentConfigs.push("import-x/recommended");
  }

  if (JSDOC_RECOMMENDED_RULES_SET.has(ruleName)) {
    parentConfigs.push("jsdoc/recommended");
  }

  if (N_RECOMMENDED_RULES_SET.has(ruleName)) {
    parentConfigs.push("n/recommended");
  }

  // -----------------------------------------------------------------------------------------------

  if (ESLINT_CONFIG_PRETTIER_RULES_SET.has(ruleName)) {
    parentConfigs.push("eslint-config-prettier");
  }

  return parentConfigs;
}

function getRuleComments(
  ruleName: string,
  rule: Linter.RuleEntry,
  baseJSText: string,
): string {
  if (isRuleHandledByTypeScriptCompiler(ruleName) && rule === "off") {
    return "Disabled because this is [handled by the TypeScript compiler](https://github.com/typescript-eslint/typescript-eslint/blob/main/packages/eslint-plugin/src/configs/eslint-recommended.ts).";
  }

  if (isRuleHandledByPrettier(ruleName) && rule === "off") {
    return "Disabled because this is [handled by Prettier](https://github.com/prettier/eslint-config-prettier/blob/main/index.js).";
  }

  const comments = extractComments(baseJSText);

  for (const comment of comments) {
    // Ignore comments that are not "attached" to code.
    if (comment.codeStart === undefined) {
      continue;
    }

    const line = getLineOfCodeStartingAtPos(comment.codeStart, baseJSText);

    // Ignore comments that are not "attached" to rule definitions.
    if (line.startsWith("const ") || !line.includes(":")) {
      continue;
    }

    const lineWithNoQuotes = line.replaceAll('"', "");
    const colonIndex = lineWithNoQuotes.indexOf(":");
    const lineRuleName = lineWithNoQuotes.slice(0, Math.max(0, colonIndex));

    if (lineRuleName !== ruleName) {
      continue;
    }

    return comment.value.replaceAll("\n", " ");
  }

  return "";
}

function isRuleHandledByTypeScriptCompiler(ruleName: string): boolean {
  const ruleNameIndex =
    ruleName as keyof typeof tseslint.configs.eslintRecommended;
  const rule = tseslint.configs.eslintRecommended[ruleNameIndex];
  if (rule === undefined) {
    return false;
  }

  if (typeof rule !== "string") {
    throw new TypeError(
      `Failed to parse rule in "@typescript-eslint/eslint-recommended": ${ruleName}`,
    );
  }

  return rule === "off";
}

function isRuleHandledByPrettier(ruleName: string): boolean {
  const rule = ESLintConfigPrettier.rules[ruleName];

  // In the config, some rules are disabled with 0 and some are disabled with "off".
  return rule === 0 || rule === "off";
}

function getLineOfCodeStartingAtPos(pos: number, code: string): string {
  const codeStartingAtPos = code.slice(pos);
  const newlineIndex = codeStartingAtPos.indexOf("\n");

  if (newlineIndex !== -1) {
    return codeStartingAtPos.slice(0, Math.max(0, newlineIndex));
  }

  return codeStartingAtPos;
}

function getMarkdownTableRow(
  ruleName: string,
  rule: Linter.RuleEntry,
  ruleURL: string,
  baseConfigText: string,
  baseConfigFileName: string,
): string {
  const baseRuleName = trimCharactersUntilLastCharacter(ruleName, "/");
  const filledRuleURL = ruleURL.replace("__RULE_NAME__", baseRuleName);
  const ruleNameWithLink = `[\`${ruleName}\`](${filledRuleURL})`;
  const enabled = getRuleEnabled(ruleName, rule);
  const enabledEmoji = enabled ? "✅" : "❌";
  const parentConfigsLinks = getParentConfigsLinks(ruleName);
  const ruleComments = getRuleComments(ruleName, rule, baseConfigText);
  const sourceFileLink = `[\`${baseConfigFileName}\`](https://github.com/complete-ts/complete/blob/main/packages/${PACKAGE_NAME}/src/base/${baseConfigFileName})`;

  return `| ${ruleNameWithLink} | ${enabledEmoji} | ${parentConfigsLinks} | ${ruleComments} | ${sourceFileLink}\n`;
}

function trimCharactersUntilLastCharacter(
  string: string,
  character: string,
): string {
  const index = string.lastIndexOf(character);
  return index === -1 ? string : string.slice(index + 1);
}
