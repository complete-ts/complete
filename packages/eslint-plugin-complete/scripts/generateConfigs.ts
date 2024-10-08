// This generates the files in the "src/configs" directory.

import type { TSESLint } from "@typescript-eslint/utils";
import { writeFile } from "complete-node";
import path from "node:path";
import { PACKAGE_ROOT } from "./constants.js";
import type { RuleDefinition } from "./utils.js";
import {
  formatWithPrettier,
  getAutoGeneratedComment,
  getRuleEntries,
  getRuleNameWithPluginNamePrefix,
  isRecommendedRule,
} from "./utils.js";

type LinterConfigRules = Record<
  string,
  TSESLint.Linter.RuleLevel | TSESLint.Linter.RuleLevelAndOptions
>;

export const CONFIGS_DIRECTORY_PATH = path.join(PACKAGE_ROOT, "src", "configs");

const BASE_CONFIG = [
  // The main config object.
  {
    // The "plugins" property is populated in the "index.ts" file.
    plugins: {},

    // The "rules" property is populated below with all of the rules of this plugin.
    rules: {},
  },

  // Disable some core ESLint rules that conflict with the rules in this plugin.
  {
    rules: {
      // The core ESLint "eqeqeq" rule will conflict with the "complete/eqeqeq-fix" rule.
      eqeqeq: "off",

      // The core ESLint "no-useless-return" rule will conflict with the
      // "complete/no-useless-return" rule.
      "no-useless-return": "off",

      // The core ESLint "no-template-curly-in-string" rule will conflict with the
      // "complete/no-template-curly-in-string-fix" rule.
      "no-template-curly-in-string": "off",

      // The core ESLint "prefer-const" rule will conflict with the "complete/prefer-const" rule.
      "prefer-const": "off",
    },
  },

  // Disable some TypeScript-specific rules in JavaScript files.
  {
    files: ["**/*.js", "**/*.cjs", "**/*.mjs", "**/*.jsx"],
    rules: {
      "complete/no-let-any": "off",
      "complete/no-object-any": "off",
      "complete/require-capital-const-assertions": "off",
      "complete/require-capital-read-only": "off",
    },
  },
] as const satisfies TSESLint.FlatConfig.Config[];

export async function generateConfigs(): Promise<void> {
  await recommended();
}

async function recommended() {
  const ruleEntries = await getRuleEntries();
  const recommendedRules = ruleEntries
    .filter((entry) => isRecommendedRule(entry[1]))
    // eslint-disable-next-line unicorn/no-array-reduce
    .reduce<LinterConfigRules>((config, entry) => reducer(config, entry), {});

  const rules = BASE_CONFIG[0].rules as Record<string, unknown>;
  for (const [ruleName, level] of Object.entries(recommendedRules)) {
    rules[ruleName] = level;
  }

  await writeConfig("recommended", BASE_CONFIG);
}

async function writeConfig(
  name: string,
  config: readonly TSESLint.FlatConfig.Config[],
) {
  const comment = getAutoGeneratedComment();
  const code = `import type { TSESLint } from "@typescript-eslint/utils";\n\nexport const ${name}: TSESLint.FlatConfig.Config[] = ${JSON.stringify(config)};`;
  const combined = comment + code;
  const content = await formatWithPrettier(combined, "typescript");

  const fileName = `${name}.ts`;
  const filePath = path.join(CONFIGS_DIRECTORY_PATH, fileName);
  writeFile(filePath, content);
}

/** Reduces records to key/value pairs. */
function reducer(
  config: LinterConfigRules,
  entry: [string, RuleDefinition],
): LinterConfigRules {
  const [ruleName] = entry;
  const fullRuleName = getRuleNameWithPluginNamePrefix(ruleName);
  config[fullRuleName] = "error";

  return config;
}
