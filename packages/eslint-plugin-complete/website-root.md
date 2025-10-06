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
<!-- begin auto-generated rules list -->

💼 Configurations enabled in.\
🚫 Configurations disabled in.\
✅ Set in the `recommended` configuration.\
🔧 Automatically fixable by the [`--fix` CLI option](https://eslint.org/docs/user-guide/command-line-interface#--fix).\
💭 Requires [type information](https://typescript-eslint.io/linting/typed-linting).

| Name                                                                                       | Description                                                                                                 | 💼 | 🚫 | 🔧 | 💭 |
| :----------------------------------------------------------------------------------------- | :---------------------------------------------------------------------------------------------------------- | :- | :- | :- | :- |
| [complete-sentences-jsdoc](docs/rules/complete-sentences-jsdoc.md)                         | Requires complete sentences for JSDoc comments                                                              | ✅  |    |    |    |
| [complete-sentences-line-comments](docs/rules/complete-sentences-line-comments.md)         | Requires complete sentences for multi-line leading line comments                                            | ✅  |    |    |    |
| [consistent-enum-values](docs/rules/consistent-enum-values.md)                             | Requires consistent enum values                                                                             | ✅  |    |    |    |
| [consistent-named-tuples](docs/rules/consistent-named-tuples.md)                           | Requires that if one or more tuple elements are named, all of them are named                                | ✅  |    |    |    |
| [eqeqeq-fix](docs/rules/eqeqeq-fix.md)                                                     | Requires the use of `===` and `!==` (and automatically fixes)                                               | ✅  |    | 🔧 |    |
| [format-jsdoc-comments](docs/rules/format-jsdoc-comments.md)                               | Disallows `/**` comments longer than N characters and multi-line comments that can be merged together       | ✅  |    | 🔧 |    |
| [format-line-comments](docs/rules/format-line-comments.md)                                 | Disallows `//` comments longer than N characters and multi-line comments that can be merged together        | ✅  |    | 🔧 |    |
| [jsdoc-code-block-language](docs/rules/jsdoc-code-block-language.md)                       | Requires a language specification for every JSDoc code block                                                | ✅  |    |    |    |
| [newline-between-switch-case](docs/rules/newline-between-switch-case.md)                   | Requires newlines between switch cases                                                                      | ✅  |    | 🔧 |    |
| [no-confusing-set-methods](docs/rules/no-confusing-set-methods.md)                         | Disallows confusing methods for sets                                                                        | ✅  |    |    | 💭 |
| [no-empty-jsdoc](docs/rules/no-empty-jsdoc.md)                                             | Disallows empty JSDoc comments (and automatically removes them)                                             | ✅  |    | 🔧 |    |
| [no-empty-line-comments](docs/rules/no-empty-line-comments.md)                             | Disallows empty line comments (and automatically removes them)                                              | ✅  |    | 🔧 |    |
| [no-explicit-array-loops](docs/rules/no-explicit-array-loops.md)                           | Disallows explicit iteration for arrays                                                                     | ✅  |    | 🔧 | 💭 |
| [no-explicit-map-set-loops](docs/rules/no-explicit-map-set-loops.md)                       | Disallows explicit iteration for maps and sets                                                              | ✅  |    | 🔧 | 💭 |
| [no-for-in](docs/rules/no-for-in.md)                                                       | Disallows "for x in y" statements                                                                           | ✅  |    |    |    |
| [no-let-any](docs/rules/no-let-any.md)                                                     | Disallows declaring variables with let that do not have a type                                              |    | ✅  |    | 💭 |
| [no-mutable-return](docs/rules/no-mutable-return.md)                                       | Disallows returning mutable arrays, maps, and sets from functions                                           | ✅  |    |    | 💭 |
| [no-number-enums](docs/rules/no-number-enums.md)                                           | Disallows number enums                                                                                      | ✅  |    |    |    |
| [no-object-any](docs/rules/no-object-any.md)                                               | Disallows declaring objects and arrays that do not have a type                                              |    | ✅  |    | 💭 |
| [no-object-methods-with-map-set](docs/rules/no-object-methods-with-map-set.md)             | Disallows using object methods with maps and sets                                                           | ✅  |    |    | 💭 |
| [no-string-length-0](docs/rules/no-string-length-0.md)                                     | Disallows checking for empty strings via the length method in favor of direct comparison to an empty string | ✅  |    |    | 💭 |
| [no-template-curly-in-string-fix](docs/rules/no-template-curly-in-string-fix.md)           | Disallows template literal placeholder syntax in regular strings (and automatically fixes)                  | ✅  |    | 🔧 |    |
| [no-undefined-return-type](docs/rules/no-undefined-return-type.md)                         | Disallows `undefined` return types on functions                                                             | ✅  |    |    | 💭 |
| [no-unnecessary-assignment](docs/rules/no-unnecessary-assignment.md)                       | Disallows useless assignments                                                                               | ✅  |    |    | 💭 |
| [no-unsafe-plusplus](docs/rules/no-unsafe-plusplus.md)                                     | Disallows unsafe and confusing uses of the `++` and `--` operators                                          | ✅  |    |    | 💭 |
| [no-useless-return](docs/rules/no-useless-return.md)                                       | Disallows redundant return statements (with no auto-fixer)                                                  | ✅  |    |    |    |
| [no-void-return-type](docs/rules/no-void-return-type.md)                                   | Disallows `void` return types on non-exported functions                                                     | ✅  |    | 🔧 | 💭 |
| [prefer-const](docs/rules/prefer-const.md)                                                 | Requires `const` declarations for variables that are never reassigned after declared (with no auto-fixer)   | ✅  |    |    |    |
| [prefer-plusplus](docs/rules/prefer-plusplus.md)                                           | Require `++` or `--` operators instead of assignment operators where applicable                             | ✅  |    | 🔧 |    |
| [prefer-postfix-plusplus](docs/rules/prefer-postfix-plusplus.md)                           | Require `i++` instead of `++i` and `i--` instead of `--i`                                                   | ✅  |    |    | 💭 |
| [prefer-readonly-parameter-types](docs/rules/prefer-readonly-parameter-types.md)           | Require function parameters to be typed as `readonly` to prevent accidental mutation of inputs              | ✅  |    |    | 💭 |
| [require-break](docs/rules/require-break.md)                                               | Requires that each non-fallthrough case of a switch statement has a `break` statement                       | ✅  |    |    |    |
| [require-capital-const-assertions](docs/rules/require-capital-const-assertions.md)         | Requires a capital letter for named objects and arrays that have a const assertion                          |    | ✅  | 🔧 |    |
| [require-capital-read-only](docs/rules/require-capital-read-only.md)                       | Requires maps/sets/arrays with a capital letter to be read-only                                             |    | ✅  |    | 💭 |
| [require-unannotated-const-assertions](docs/rules/require-unannotated-const-assertions.md) | Disallows explicit type annotations for variables that have a const assertion                               | ✅  |    |    |    |
| [require-variadic-function-argument](docs/rules/require-variadic-function-argument.md)     | Requires that variadic functions must be supplied with at least one argument                                | ✅  |    |    | 💭 |
| [strict-array-methods](docs/rules/strict-array-methods.md)                                 | Requires boolean return types on some specific array methods                                                | ✅  |    |    | 💭 |
| [strict-enums](docs/rules/strict-enums.md)                                                 | Disallows the usage of unsafe enum patterns                                                                 | ✅  |    |    | 💭 |
| [strict-undefined-functions](docs/rules/strict-undefined-functions.md)                     | Disallows empty return statements in functions annotated as returning undefined                             | ✅  |    |    | 💭 |
| [strict-void-functions](docs/rules/strict-void-functions.md)                               | Disallows non-empty return statements in functions annotated as returning void                              | ✅  |    |    |    |

<!-- end auto-generated rules list -->

## Automatic Fixing

You probably already use [Prettier](https://prettier.io/), which is helpful to automatically format files. You probably even have your IDE set up to run Prettier every time your save a file. This kind of thing saves you a tremendous amount of time - you can type out a bunch of code completely unformatted, and then press `Ctrl + s` at the end to automatically fix everything. (Alternatively, you could press `Ctrl + shift + f` to format the file without saving it, but it's simpler to just use one hotkey for everything.)

In a similar way to Prettier, this ESLint plugin contains several rules that are designed to automatically apply whenever you save the file (like the [`complete/format-jsdoc-comments`](eslint-plugin-complete/rules/format-jsdoc-comments) rule). These rules are "fixers", which are applied when ESLint is executed with the "--fix" flag. So, in the same way that you configure Prettier to run on save, you should also configure `eslint --fix` to run on save.

For example, if you use [VSCode](https://code.visualstudio.com/), and you have the [Prettier](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode) and the [ESLint](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint) extensions installed, you can add the following to your repository's `.vscode/settings.json` file:

<!-- We cannot use "jsonc" as the language below because Docusaurus will not display the colors properly. -->

```json
{
  // Automatically run the formatter when certain files are saved.
  "[javascript][typescript][javascriptreact][typescriptreact]": {
    "editor.codeActionsOnSave": {
      "source.fixAll.eslint": "explicit"
    },
    "editor.defaultFormatter": "esbenp.prettier-vscode",
    "editor.formatOnSave": true
  }
}
```

## Comment Formatting

For a discussion around comments and the motivations for some of the comment rules in the plugin, see [this page](/eslint-plugin-complete/comments).
