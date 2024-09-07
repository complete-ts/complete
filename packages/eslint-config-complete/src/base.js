import ESLintPluginComplete from "eslint-plugin-complete";
import tseslint from "typescript-eslint";
import { baseESLint } from "./baseConfigs/base-eslint.js";
import { baseImportX } from "./baseConfigs/base-import-x.js";
import { baseJSDoc } from "./baseConfigs/base-jsdoc.js";
import { baseN } from "./baseConfigs/base-n.js";
import { baseStylistic } from "./baseConfigs/base-stylistic.js";
import { baseTypeScriptESLint } from "./baseConfigs/base-typescript-eslint.js";
import { baseUnicorn } from "./baseConfigs/base-unicorn.js";

// Hot-patch "eslint-plugin-complete" to convert errors to warnings.
for (const config of ESLintPluginComplete.configs.recommended) {
  if (config.rules !== undefined) {
    for (const [key, value] of Object.entries(config.rules)) {
      if (value === "error") {
        config.rules[key] = "warn";
      }
    }
  }
}

/**
 * This ESLint config is meant to be used as a base for all TypeScript projects.
 *
 * Rule modifications are split out into different files for better organization (based on the
 * originating plugin) .
 */
export const completeConfigBase = tseslint.config(
  ...baseESLint,
  ...baseTypeScriptESLint,
  ...baseStylistic,
  ...baseImportX,
  ...baseJSDoc,
  ...baseN, // "n" stands for Node.
  ...baseUnicorn,

  // `eslint-plugin-complete` provides extra miscellaneous rules to keep code safe:
  // https://github.com/complete-ts/complete/tree/main/packages/eslint-plugin-complete
  ...ESLintPluginComplete.configs.recommended,

  // We prefer the official `reportUnusedDisableDirectives` linter option over the 3rd-party plugin
  // of "eslint-plugin-eslint-comments".
  {
    linterOptions: {
      reportUnusedDisableDirectives: "warn",
    },
  },

  {
    // By default, ESLint ignores "**/node_modules/" and ".git/":
    // https://eslint.org/docs/latest/use/configure/ignore#ignoring-files
    // We also ignore want to ignore the "dist" directory since it is the idiomatic place for
    // compiled output in TypeScript.
    ignores: ["**/dist/"],
  },
);
