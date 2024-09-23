// Generates the rules table in "README.md".

import { assertDefined } from "complete-common";
import { setMarkdownContentInsideHTMLMarker } from "complete-node";
import path from "node:path";
import { PACKAGE_NAME, PACKAGE_ROOT } from "./constants.js";
import type { RuleDefinition } from "./utils.js";
import {
  getRuleEntries,
  getRuleNameWithPluginNamePrefix,
  isRecommendedRule,
} from "./utils.js";

const EMOJI_RECOMMENDED = ":white_check_mark:";
const EMOJI_FIXABLE = ":wrench:";
const EMOJI_REQUIRES_TYPE_INFORMATION = ":thought_balloon:";

export const README_MD_PATH = path.join(PACKAGE_ROOT, "website-root.md");
const MARKER_NAME = "RULES_TABLE";

export async function generateReadme(): Promise<void> {
  const rulesTable = await getRulesTable();
  await setMarkdownContentInsideHTMLMarker(
    README_MD_PATH,
    rulesTable,
    MARKER_NAME,
    PACKAGE_ROOT,
  );
}

async function getRulesTable() {
  const header = `
| Name | Description | :white_check_mark: | :wrench: | :thought_balloon: |
| ---- | ----------- | ------------------ | -------- | ----------------- |
  `.trim();
  const headerWithNewline = `${header}\n`;

  const ruleEntries = await getRuleEntries();
  const ruleRows = ruleEntries
    .map((ruleEntry) => getRuleTableRow(ruleEntry))
    .join("\n");

  return `${headerWithNewline}${ruleRows}`;
}

function getRuleTableRow(ruleEntry: [string, RuleDefinition]) {
  const [ruleName, rule] = ruleEntry;

  assertDefined(
    rule.meta.docs,
    `Rule ${ruleName} does not have a "docs" entry.`,
  );

  const fullRuleName = getRuleNameWithPluginNamePrefix(ruleName);
  const nameWithLink = `[\`${fullRuleName}\`](${PACKAGE_NAME}/rules/${ruleName})`;
  const { description } = rule.meta.docs;
  const isRecommended = isRecommendedRule(rule) ? EMOJI_RECOMMENDED : "";
  const isFixable = rule.meta.fixable === undefined ? "" : EMOJI_FIXABLE;
  const requiresTypeInformation =
    "requiresTypeChecking" in rule.meta.docs &&
    rule.meta.docs.requiresTypeChecking === true
      ? EMOJI_REQUIRES_TYPE_INFORMATION
      : "";

  if (description.endsWith(".")) {
    throw new Error(
      `The "${ruleName}" rule ends with a period, which is incorrect and should be deleted.`,
    );
  }

  const ruleCells = [
    nameWithLink,
    description,
    isRecommended,
    isFixable,
    requiresTypeInformation,
  ];

  return `| ${ruleCells.join(" | ")} |`;
}
