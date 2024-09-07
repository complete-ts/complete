# complete-tsconfig

[![npm version](https://img.shields.io/npm/v/complete-tsconfig.svg)](https://www.npmjs.com/package/complete-tsconfig)

These are shared TypeScript configuration files that are intended to be used in [TypeScript](https://www.typescriptlang.org/) projects.

Note that if you use these configs with `pnpm`, you must also install `@tsconfig/strictest`, since pnpm does not properly handle transitive dependencies. (You also must also install `@tsconfig/node-lts` if you are using the Node.js config.)

## Install

```sh
npm install complete-tsconfig --save
```

## Usage

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

Note that the [base config](tsconfig.base.json) handily specifies an `include` of `["./src/**/*.ts", "./src/**/*.tsx"]` and an `outDir` of `"./dist"`, so you can omit those options to keep your config file small and clean.

## Strict Schema

By default, VSCode will automatically recognize TypeScript config files and apply a schema. However, this schema allows for additional properties, in order to prevent throwing errors for tools/frameworks like [Angular](https://angular.dev/) adding [custom fields](https://angular.dev/reference/configs/angular-compiler-options).

However, the problem with this is that you might accidentally misspell a property (or e.g. accidentally add a compiler option to the root object). In these cases, you will not get a red squiggly line in your editor, making for a frustrating troubleshooting experience.

In order to fix this, you should use the strict schema in all of your TypeScript configuration files like this:

```jsonc
{
  "$schema": "https://raw.githubusercontent.com/complete-ts/complete/main/packages/complete-tsconfig/schemas/tsconfig-strict-schema.json",

  // Other configuration goes here.
}
```
