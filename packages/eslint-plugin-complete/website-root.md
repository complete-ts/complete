# `eslint-plugin-complete`

[![npm version](https://img.shields.io/npm/v/eslint-plugin-complete.svg)](https://www.npmjs.com/package/eslint-plugin-complete)

## Introduction

This is an [ESLint](https://eslint.org/) plugin containing rules that can help make your TypeScript code more safe or more strict.

## Install

### Using `complete-lint`

This package is part of the [`complete-lint`](/complete-lint) meta-linting package. If you want to enable a comprehensive ESLint config in your TypeScript project as quickly as possible, it is recommended that instead of consuming `eslint-plugin-complete` directly, you instead list `complete-lint` as a dependency, as that will install the plugin, the config, and other goodies.

For installation instructions, see [the `complete-lint` page](/complete-lint).

### Manually

If you do not want to use the `complete-lint` meta-package, then you can install this plugin manually:

```sh
npm install --save-dev eslint typescript eslint-plugin-complete
```

(`eslint` and `typescript` are peer-dependencies.)

## Usage

If you are using [`eslint-config-complete`](/eslint-config-complete), then this plugin is automatically enabled. Otherwise, you can manually enable this plugin and the recommended rules with the following "eslint.config.mjs" file:

```js
// @ts-check

import ESLintPluginComplete from "eslint-plugin-complete";
import { defineConfig } from "eslint/config";

export default defineConfig(
  {
    plugins: {
      complete: ESLintPluginComplete,
    },
  },

  ...ESLintPluginComplete.configs.recommended,
);
```

Alternatively, you can omit the recommended config and just enable the specific rules that you need:

```ts
// @ts-check

import ESLintPluginComplete from "eslint-plugin-complete";
import { defineConfig } from "eslint/config";

export default defineConfig({
  plugins: {
    complete: ESLintPluginComplete,
  },

  rules: {
    "complete/no-let-any": "error",
  },
});
```

Note that if you get type errors, you have have to use a `@ts-expect-error` directive, due to [bugs in the upstream package](https://github.com/typescript-eslint/typescript-eslint/issues/11543).

## Configs

- `recommended` - Currently, every rule in this plugin is recommended.

## Rules

Each rule has emojis denoting:

- :white_check_mark: - if it belongs to the `recommended` configuration
- :wrench: - if some problems reported by the rule are automatically fixable by the `--fix` [command line option](https://eslint.org/docs/latest/user-guide/command-line-interface#fixing-problems)
- :thought_balloon: - if it requires type information

<!-- Do not manually modify the RULES_TABLE section. Instead, run: npm run generate -->
<!-- RULES_TABLE -->

| Name                                                                                                                 | Description                                                                                                 | :white_check_mark: | :wrench: | :thought_balloon: |
| -------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------- | ------------------ | -------- | ----------------- |
| [`complete/complete-sentences-jsdoc`](eslint-plugin-complete/rules/complete-sentences-jsdoc)                         | Requires complete sentences for JSDoc comments                                                              | :white_check_mark: |          |                   |
| [`complete/complete-sentences-line-comments`](eslint-plugin-complete/rules/complete-sentences-line-comments)         | Requires complete sentences for multi-line leading line comments                                            | :white_check_mark: |          |                   |
| [`complete/consistent-enum-values`](eslint-plugin-complete/rules/consistent-enum-values)                             | Requires consistent enum values                                                                             | :white_check_mark: |          |                   |
| [`complete/consistent-named-tuples`](eslint-plugin-complete/rules/consistent-named-tuples)                           | Requires that if one or more tuple elements are named, all of them are named                                | :white_check_mark: |          |                   |
| [`complete/eqeqeq-fix`](eslint-plugin-complete/rules/eqeqeq-fix)                                                     | Requires the use of `===` and `!==` (and automatically fixes)                                               | :white_check_mark: | :wrench: |                   |
| [`complete/format-jsdoc-comments`](eslint-plugin-complete/rules/format-jsdoc-comments)                               | Disallows `/**` comments longer than N characters and multi-line comments that can be merged together       | :white_check_mark: | :wrench: |                   |
| [`complete/format-line-comments`](eslint-plugin-complete/rules/format-line-comments)                                 | Disallows `//` comments longer than N characters and multi-line comments that can be merged together        | :white_check_mark: | :wrench: |                   |
| [`complete/jsdoc-code-block-language`](eslint-plugin-complete/rules/jsdoc-code-block-language)                       | Requires a language specification for every JSDoc code block                                                | :white_check_mark: |          |                   |
| [`complete/newline-between-switch-case`](eslint-plugin-complete/rules/newline-between-switch-case)                   | Requires newlines between switch cases                                                                      | :white_check_mark: | :wrench: |                   |
| [`complete/no-confusing-set-methods`](eslint-plugin-complete/rules/no-confusing-set-methods)                         | Disallows confusing methods for sets                                                                        | :white_check_mark: |          | :thought_balloon: |
| [`complete/no-empty-jsdoc`](eslint-plugin-complete/rules/no-empty-jsdoc)                                             | Disallows empty JSDoc comments                                                                              | :white_check_mark: | :wrench: |                   |
| [`complete/no-empty-line-comments`](eslint-plugin-complete/rules/no-empty-line-comments)                             | Disallows empty line comments                                                                               | :white_check_mark: | :wrench: |                   |
| [`complete/no-explicit-array-loops`](eslint-plugin-complete/rules/no-explicit-array-loops)                           | Disallows explicit iteration for arrays                                                                     | :white_check_mark: | :wrench: | :thought_balloon: |
| [`complete/no-explicit-map-set-loops`](eslint-plugin-complete/rules/no-explicit-map-set-loops)                       | Disallows explicit iteration for maps and sets                                                              | :white_check_mark: | :wrench: | :thought_balloon: |
| [`complete/no-for-in`](eslint-plugin-complete/rules/no-for-in)                                                       | Disallows "for x in y" statements                                                                           | :white_check_mark: |          |                   |
| [`complete/no-let-any`](eslint-plugin-complete/rules/no-let-any)                                                     | Disallows declaring variables with let that do not have a type                                              | :white_check_mark: |          | :thought_balloon: |
| [`complete/no-mutable-return`](eslint-plugin-complete/rules/no-mutable-return)                                       | Disallows returning mutable arrays, maps, and sets from functions                                           | :white_check_mark: |          | :thought_balloon: |
| [`complete/no-number-enums`](eslint-plugin-complete/rules/no-number-enums)                                           | Disallows number enums                                                                                      | :white_check_mark: |          |                   |
| [`complete/no-object-any`](eslint-plugin-complete/rules/no-object-any)                                               | Disallows declaring objects and arrays that do not have a type                                              | :white_check_mark: |          | :thought_balloon: |
| [`complete/no-object-methods-with-map-set`](eslint-plugin-complete/rules/no-object-methods-with-map-set)             | Disallows using object methods with maps and sets                                                           | :white_check_mark: |          | :thought_balloon: |
| [`complete/no-string-length-0`](eslint-plugin-complete/rules/no-string-length-0)                                     | Disallows checking for empty strings via the length method in favor of direct comparison to an empty string | :white_check_mark: |          | :thought_balloon: |
| [`complete/no-template-curly-in-string-fix`](eslint-plugin-complete/rules/no-template-curly-in-string-fix)           | Disallows template literal placeholder syntax in regular strings (and automatically fixes)                  | :white_check_mark: | :wrench: |                   |
| [`complete/no-undefined-return-type`](eslint-plugin-complete/rules/no-undefined-return-type)                         | Disallows `undefined` return types on functions                                                             | :white_check_mark: |          | :thought_balloon: |
| [`complete/no-unnecessary-assignment`](eslint-plugin-complete/rules/no-unnecessary-assignment)                       | Disallows useless assignments                                                                               | :white_check_mark: |          | :thought_balloon: |
| [`complete/no-unsafe-plusplus`](eslint-plugin-complete/rules/no-unsafe-plusplus)                                     | Disallow unsafe and confusing uses of the "++" and "--" operators                                           | :white_check_mark: |          | :thought_balloon: |
| [`complete/no-useless-return`](eslint-plugin-complete/rules/no-useless-return)                                       | Disallow redundant return statements (with no auto-fixer)                                                   | :white_check_mark: |          |                   |
| [`complete/no-void-return-type`](eslint-plugin-complete/rules/no-void-return-type)                                   | Disallows `void` return types on non-exported functions                                                     | :white_check_mark: | :wrench: | :thought_balloon: |
| [`complete/prefer-const`](eslint-plugin-complete/rules/prefer-const)                                                 | Require `const` declarations for variables that are never reassigned after declared (with no auto-fixer)    | :white_check_mark: |          |                   |
| [`complete/prefer-plusplus`](eslint-plugin-complete/rules/prefer-plusplus)                                           | Require "++" or "--" operators instead of assignment operators where applicable                             | :white_check_mark: | :wrench: |                   |
| [`complete/prefer-postfix-plusplus`](eslint-plugin-complete/rules/prefer-postfix-plusplus)                           | Require `i++` instead of `++i` and `i--` instead of `--i`                                                   | :white_check_mark: |          | :thought_balloon: |
| [`complete/prefer-readonly-parameter-types`](eslint-plugin-complete/rules/prefer-readonly-parameter-types)           | Require function parameters to be typed as `readonly` to prevent accidental mutation of inputs              | :white_check_mark: |          | :thought_balloon: |
| [`complete/require-break`](eslint-plugin-complete/rules/require-break)                                               | Requires that each case of a switch statement has a `break` statement                                       | :white_check_mark: |          |                   |
| [`complete/require-capital-const-assertions`](eslint-plugin-complete/rules/require-capital-const-assertions)         | Requires a capital letter for named objects and arrays that have a const assertion                          | :white_check_mark: | :wrench: |                   |
| [`complete/require-capital-read-only`](eslint-plugin-complete/rules/require-capital-read-only)                       | Requires maps/sets/arrays with a capital letter to be read-only                                             | :white_check_mark: |          | :thought_balloon: |
| [`complete/require-unannotated-const-assertions`](eslint-plugin-complete/rules/require-unannotated-const-assertions) | Disallows explicit type annotations for variables that have a const assertion                               | :white_check_mark: |          |                   |
| [`complete/require-variadic-function-argument`](eslint-plugin-complete/rules/require-variadic-function-argument)     | Requires that variadic functions must be supplied with at least one argument                                | :white_check_mark: |          | :thought_balloon: |
| [`complete/strict-array-methods`](eslint-plugin-complete/rules/strict-array-methods)                                 | Requires boolean return types on some specific array methods                                                | :white_check_mark: |          | :thought_balloon: |
| [`complete/strict-enums`](eslint-plugin-complete/rules/strict-enums)                                                 | Disallows the usage of unsafe enum patterns                                                                 | :white_check_mark: |          | :thought_balloon: |
| [`complete/strict-undefined-functions`](eslint-plugin-complete/rules/strict-undefined-functions)                     | Disallows empty return statements in functions annotated as returning undefined                             | :white_check_mark: |          | :thought_balloon: |
| [`complete/strict-void-functions`](eslint-plugin-complete/rules/strict-void-functions)                               | Disallows non-empty return statements in functions annotated as returning void                              | :white_check_mark: |          |                   |

<!-- /RULES_TABLE -->

## Automatic Fixing

You probably already use [Prettier](https://prettier.io/), which is helpful to automatically format files. You probably even have your IDE set up to run Prettier every time your save a file. This kind of thing saves you a tremendous amount of time - you can type out a bunch of code completely unformatted, and then press `Ctrl + s` at the end to automatically fix everything. (Alternatively, you could press `Ctrl + shift + f` to format the file without saving it, but it's simpler to just use one hotkey for everything.)

In a similar way to Prettier, this ESLint plugin contains several rules that are designed to automatically apply whenever you save the file (like the [`complete/format-jsdoc-comments`](eslint-plugin-complete/rules/format-jsdoc-comments) rule). These rules are "fixers", which are applied when ESLint is executed with the "--fix" flag. So, in the same way that you configure Prettier to run on save, you should also configure `eslint --fix` to run on save.

For example, if you use [VSCode](https://code.visualstudio.com/), and you have the [Prettier](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode) and the [ESLint](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint) extensions installed, you can add the following to your repository's `.vscode/settings.json` file:

```jsonc
{
  // Automatically run the formatter when certain files are saved.
  "[javascript][typescript][javascriptreact][typescriptreact]": {
    "editor.codeActionsOnSave": {
      "source.fixAll.eslint": "explicit",
    },
    "editor.defaultFormatter": "esbenp.prettier-vscode",
    "editor.formatOnSave": true,
  },
}
```

## Comment Formatting

For a discussion around comments and the motivations for some of the comment rules in the plugin, see [this page](/eslint-plugin-complete/comments).
