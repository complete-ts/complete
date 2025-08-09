import tseslint from "typescript-eslint";
import { baseComplete } from "./base/base-complete.js";
import { baseESLint } from "./base/base-eslint.js";
import { baseImportX } from "./base/base-import-x.js";
import { baseJSDoc } from "./base/base-jsdoc.js";
import { baseN } from "./base/base-n.js";
import { basePackageJSON } from "./base/base-package-json.js";
import { baseStylistic } from "./base/base-stylistic.js";
import { baseTypeScriptESLint } from "./base/base-typescript-eslint.js";
import { baseUnicorn } from "./base/base-unicorn.js";

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
  ...basePackageJSON,
  ...baseUnicorn,
  ...baseComplete,

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
    // We also ignore want to ignore:
    // - The "dist" directory, since it is the idiomatic place for compiled output in TypeScript.
    // - Minified JavaScript files.
    ignores: ["**/dist/", "*.min.js"],
  },
);
