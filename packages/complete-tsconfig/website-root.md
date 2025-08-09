# `complete-tsconfig`

[![npm version](https://img.shields.io/npm/v/complete-tsconfig.svg)](https://www.npmjs.com/package/complete-tsconfig)

## Introduction

These are shared TypeScript configuration files that are intended to be used in [TypeScript](https://www.typescriptlang.org/) projects. They are based on the [`@tsconfig/strictest`](https://github.com/tsconfig/bases/blob/main/bases/strictest.json) configs for maximum safety.

## Configs Offered

- [tsconfig.base.json](https://github.com/complete-ts/complete/blob/main/packages/complete-tsconfig/tsconfig.base.json) - A config meant to be used by all TypeScript projects.
- [tsconfig.browser.json](https://github.com/complete-ts/complete/blob/main/packages/complete-tsconfig/tsconfig.browser.json) - A config meant for projects running in the browser.
- [tsconfig.bun.json](https://github.com/complete-ts/complete/blob/main/packages/complete-tsconfig/tsconfig.bun.json) - A config meant for projects running in a [Bun](https://bun.sh/) environment.
- [tsconfig.node.json](https://github.com/complete-ts/complete/blob/main/packages/complete-tsconfig/tsconfig.node.json) - A config meant for projects running in a [Node.js](https://nodejs.org/en) environment.

## Install

### Using `complete-lint`

This package is part of the [`complete-lint`](/complete-lint) meta-linting package. If you also need to install ESLint-related dependencies, then it is recommended that instead of consuming `complete-tsconfig` directly, you instead list `complete-lint` as a dependency, as that will install the configs and other goodies.

For installation instructions, see [the `complete-lint` page](/complete-lint).

### Manually

If you do not want to use the `complete-lint` meta-package, then you can install this package manually:

```sh
npm install complete-tsconfig --save
```

Note that if you use the [pnpm](https://pnpm.io/) package manager, you must use the [`shamefully-hoist`](https://pnpm.io/npmrc#shamefully-hoist) option, since pnpm does not handle transitive dependencies by default. (Alternatively, you could [manually install the dependencies](https://github.com/complete-ts/complete/blob/main/packages/complete-tsconfig/package.json).)

## Usage

First, extend from the base config. Second, you can optionally extend from either the Node.js config or the browser config. For example:

```jsonc
// The configuration file for TypeScript.
{
  "$schema": "https://raw.githubusercontent.com/complete-ts/complete/main/packages/complete-tsconfig/schemas/tsconfig-strict-schema.json",

  "extends": [
    // https://github.com/complete-ts/complete/blob/main/packages/complete-tsconfig/tsconfig.base.json
    "complete-tsconfig/tsconfig.base.json",

    // https://github.com/complete-ts/complete/blob/main/packages/complete-tsconfig/tsconfig.node.json
    "complete-tsconfig/tsconfig.node.json",
  ],
}
```

Note that the [base config](https://github.com/complete-ts/complete/blob/main/packages/complete-tsconfig/tsconfig.base.json) handily specifies an `include` of `["./src/**/*.ts", "./src/**/*.tsx"]` and an `outDir` of `"./dist"`, so you can omit those options to keep your config file small and clean.

## Strict Schema

By default, VSCode will automatically recognize TypeScript config files and apply a schema. However, this schema allows for additional properties in order to prevent throwing errors for tools/frameworks like [Angular](https://angular.dev/) that add [custom fields](https://angular.dev/reference/configs/angular-compiler-options).

However, the problem with this is that you might accidentally misspell a property (or e.g. accidentally add a compiler option to the root object). In these cases, you will not get a red squiggly line in your editor, making for a frustrating troubleshooting experience.

In order to fix this, you should use the strict schema in all of your TypeScript configuration files like this:

```jsonc
{
  "$schema": "https://raw.githubusercontent.com/complete-ts/complete/main/packages/complete-tsconfig/schemas/tsconfig-strict-schema.json",

  // Other configuration goes here.
}
```
