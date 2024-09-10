# `complete-lint`

[![npm version](https://img.shields.io/npm/v/complete-lint.svg)](https://www.npmjs.com/package/complete-lint)

This is a meta package to install all of the dependencies necessary for [ESLint](https://eslint.org/) & [Prettier](https://prettier.io/) to work with a typical TypeScript project. (ESLint is the best code problem checker & Prettier is the best code formatter.)

## Why This Package Is Useful

It is a pain to get Prettier & ESLint working with TypeScript. `complete-lint` is designed to make it as easy as possible. Don't clutter your `package.json` file with 15+ different ESLint-related dependencies. Don't bother researching which of the hundreds of existing ESLint rules to turn on and turn off. Just use `complete-lint`.

If you are ready to start, see the [installation instructions](#installation-instructions).

## Installation Instructions

### Step 0 - Get a TypeScript Project Set Up

It should have a `package.json` file, a `tsconfig.json` file, and so on.

### Step 1 - Install the Dependency

```sh
npm install complete-lint --save-dev
```

(It should be a development dependency because it is only used to lint your code before compilation/deployment.)

Note that if you use [pnpm](https://pnpm.io/), you cannot use `complete-lint`, since pnpm does not handle transitive dependencies properly.

### Step 2 - Create `eslint.config.mjs`

Create a `eslint.config.mjs` file in the root of your repository:

```js
// This is the configuration file for ESLint, the TypeScript linter:
// https://eslint.org/docs/latest/use/configure/

// @ts-check

import { completeConfigBase } from "eslint-config-complete";
import tseslint from "typescript-eslint";

export default tseslint.config(
  // We use "eslint-config-complete" as the base of the config:
  // https://github.com/complete-ts/complete/blob/main/packages/eslint-config-complete/src/base.js
  ...completeConfigBase,

  {
    rules: {
      // Insert changed or disabled rules here, if necessary.
    },
  },
);
```

### Step 3 - Create `prettier.config.mjs`

Create a `prettier.config.mjs` file at the root of your repository:

```js
// This is the configuration file for Prettier, the auto-formatter:
// https://prettier.io/docs/en/configuration.html

// @ts-check

/** @type {import("prettier").Config} */
const config = {
  plugins: [
    "prettier-plugin-organize-imports", // Prettier does not format imports by default.
    "prettier-plugin-packagejson", // Prettier does not format "package.json" by default.
  ],

  overrides: [
    // Allow proper formatting of JSONC files that have JSON file extensions.
    {
      files: ["**/.vscode/*.json", "**/tsconfig.json", "**/tsconfig.*.json"],
      options: {
        parser: "jsonc",
      },
    },
  ],
};

export default config;
```

### Step 4 - Editor Integration

You will probably want to set up your code editor such that both ESLint and Prettier are automatically run every time the file is saved. Below, we show how to do that with [VSCode](https://code.visualstudio.com/), the most popular TypeScript editor / IDE. It is also possible to set this up in other editors such as [Webstorm](https://www.jetbrains.com/webstorm/) and [Neovim](https://neovim.io/), but we don't provide detailed instructions for that here.

### Extensions

In order for the linter to work inside of VSCode, you will have to install the following extensions:

- [ESLint](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint)
- [Prettier](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode)

Additionally, you might also want to install the CSpell extension, which is extremely useful to spell check an entire codebase:

- [CSpell](https://marketplace.visualstudio.com/items?itemName=streetsidesoftware.code-spell-checker)

Once installed, these extensions provide a nice dichotomy:

- Red squiggly underlines are type-errors from the TypeScript compiler.
- Yellow squiggly underlines are warnings from ESLint.
- Blue squiggly underlines are misspelled words. (You can use "Quick Fix" to find suggestions for the proper spelling. Or, you can right click --> `Spelling` --> `Add Words to CSpell Configuration` to ignore a specific word.)

#### `.vscode/settings.json`

Furthermore, you will probably want Prettier and ESLint to be run automatically every time you save a file. You can tell VSCode to do this by adding the following to your project's `.vscode/settings.json` file:

```ts
// These are Visual Studio Code settings that should apply to this particular repository.
{
  "[javascript][typescript][javascriptreact][typescriptreact]": {
    "editor.codeActionsOnSave": {
      "source.fixAll.eslint": "explicit",
    },
    "editor.defaultFormatter": "esbenp.prettier-vscode",
    "editor.formatOnSave": true,
  },
  "[css][html][json][jsonc][markdown][postcss][yaml]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode",
    "editor.formatOnSave": true,
  },
}
```

(Create the ".vscode" directory and the "settings.json" file if they do not already exist.)

You should also commit this file to your project's repository so that this behavior is automatically inherited by anyone who clones the project (and uses VSCode).

#### `.vscode/extensions.json`

Optionally, you can also provide a hint to anyone cloning your repository that they should install the required extensions by creating a `.vscode/settings.json` file::

```ts
// These are Visual Studio Code extensions that are intended to be used with this particular
// repository: https://go.microsoft.com/fwlink/?LinkId=827846
{
  "recommendations": [
    "esbenp.prettier-vscode", // The TypeScript formatter
    "dbaeumer.vscode-eslint", // The TypeScript linter
    "streetsidesoftware.code-spell-checker", // A spell-checker extension based on CSpell
  ],
}
```

### Step 5 - Create a Lint Script

At this point, we should be able to see squiggly lines when errors happen, making for a nice editor experience. However, there might be errors in files that are not currently open in our editor. Thus, we might want to run a command to check the entire repository for errors. Since we use several different tools, we need to run several different commands to invoke each tool. One way to accomplish this is to create a `./scripts/lint.ts` file that runs all the tools in parallel:

```ts
import { $, lintScript } from "complete-node";

await lintScript(async () => {
  const promises = [
    // Use TypeScript to type-check the code.
    $`tsc --noEmit`,

    // Use ESLint to lint the TypeScript code.
    // - "--max-warnings 0" makes warnings fail, since we set all ESLint errors to warnings.
    $`eslint --max-warnings 0 .`,

    // Use Prettier to check formatting.
    // - "--log-level=warn" makes it only output errors.
    $`prettier --log-level=warn --check .`,

    // Use Knip to check for unused files, exports, and dependencies.
    $`knip --no-progress`,

    // Use CSpell to spell check every file.
    // - "--no-progress" and "--no-summary" make it only output errors.
    $`cspell --no-progress --no-summary .`,

    // Check for unused words in the CSpell configuration file.
    $`cspell-check-unused-words`,
  ];

  await Promise.all(promises);
});
```

If you want, you can also put the script in your "package.json" file:

```json
  "scripts": {
    "lint": "tsx ./scripts/lint.ts"
  },
```

That allows you to type `npm run lint` to more easily run the script.

### Step 6 - Lint in CI

If you use GitHub, you can create a [GitHub Actions](https://docs.github.com/en/actions) file to automatically run linting for [continuous integration](https://en.wikipedia.org/wiki/Continuous_integration) (CI). This is nice because the linting will automatically run on every commit, showing a green checkmark or a red x when you look at the repository on GitHub. You can also do things like configure alerts for when linting fails.

To set this up, create a `./.github/workflows/ci.yml` file:

```yml
name: CI

on: [push, pull_request]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: lts/*
          cache: npm
      - run: npm ci
      - run: npm run build

  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: lts/*
          cache: npm
      - run: npm ci
      - run: npm run lint

  # You can add a "test" job too if your repository includes tests.
```

## Package Documentation

These are the specific packages that `complete-lint` provides:

- [`@prettier/plugin-xml`](https://github.com/prettier/plugin-xml) - Allows Prettier to format XML files, which are common in some kinds of projects.
- [`complete-node`](/complete-node) - A library that allows you to easily create a linting script to run several tools at once.
- [`complete-tsconfig`](/complete-tsconfig) - A collection of TypeScript configuration files that allow for maximum safety.
- [`cspell`](https://github.com/streetsidesoftware/cspell) - A spell checker for code that is intended to be paired with the [Code Spell Checker VSCode extension](https://marketplace.visualstudio.com/items?itemName=streetsidesoftware.code-spell-checker). Even though this does not have to do with ESLint or Prettier, this is included in the meta-package because most projects should be linting for misspelled words.
- [`cspell-check-unused-words`](https://github.com/Zamiell/cspell-check-unused-words) - A helpful script that can detect unused words inside your CSpell configuration, allowing you to clean up unnecessary entries.
- [`eslint`](https://github.com/eslint/eslint) - The main linter engine for JavaScript/TypeScript, as explained above.
- [`eslint-import-resolver-typescript`](https://github.com/import-js/eslint-import-resolver-typescript) - Necessary for `eslint-plugin-import-x` to work properly, which is part of `eslint-config-complete`. (Even though it is a direct dependency of `eslint-config-complete`, it does not work properly when it is a nested transitive dependency, so it must explicitly be in this package.)
- [`eslint-config-complete`](/eslint-config-complete) - Contains the master ESLint configuration.
- [`knip`](https://github.com/webpro/knip) - A tool to look for unused files, dependencies, and exports. Even though this does not have to do with ESLint or Prettier, this is included in the meta-package because most projects should be linting for unused exports.
- [`prettier`](https://github.com/prettier/prettier) - The main code formatter, as explained above.
- [`prettier-plugin-organize-imports`](https://github.com/simonhaenisch/prettier-plugin-organize-imports) - A plugin used because Prettier will not organize imports automatically.
- [`prettier-plugin-packagejson`](https://github.com/matzkoh/prettier-plugin-packagejson) - A plugin used because Prettier will not organize "package.json" files automatically.
- [`tsx`](https://github.com/privatenumber/tsx) - A tool to run a TypeScript file directly. This is included so that you can execute your linting script without having to explicitly install it.

## Why Code Formatting is Important

In the 90's, the most popular scripting language in the world was [Perl](https://www.perl.org/), invented by [Larry Wall](https://en.wikipedia.org/wiki/Larry_Wall). One of Larry's slogans was that "There Is Always More Than One Way To Do It", abbreviated as the TIAMTOWTDI principle. In Perl, there were many different ways to do even the most basic thing, like adding an element to an array. This resulted in a Perl ecosystem where programs often looked nothing like each other, where everyone had different coding styles, and where everything was hard to read and comprehend.

One of the key insights of [Guido van Rossum](https://en.wikipedia.org/wiki/Guido_van_Rossum), the creator of the [Python](https://www.python.org/) programming language, was that [code is read much more often than it is written](https://www.python.org/dev/peps/pep-0008/). Python was designed to be concise, clean, and readable. It had standard ways of doing things and recommended that everyone follow the [PEP-8 coding standard](https://www.python.org/dev/peps/pep-0008/). And so, in the 90s, there was a massive movement away from Perl and towards Python. Now, Python is the [most popular programming language in the world](https://pypl.github.io/PYPL.html).

[Go](https://golang.org/), the programming language designed at Google in 2009, took this concept a step further. They included a code formatter inside of the language itself, called `gofmt` (which is short for "Go formatter"). When you are coding a Go program, it will automatically format all of the code as soon as you save the file. This can be surprising and disturbing for newcomers: "Why does `gofmt` make my code ugly?!"

However, once people get used to the formatter, they realize that it saves them a _tremendous amount of time_. By ignoring all formatting and typing out code "raw", and then summoning the formatter to instantly fix everything, you can quite literally code twice as fast. Rob Pike, one of the creators of Go, famously said that "gofmt's style is no one's favorite, yet gofmt is everyone's favorite". ([This YouTube clip](https://www.youtube.com/embed/PAAkCSZUG1c?start=523&end=568) of Rob is a much-watch!)

`gofmt` is nice because it saves people from mundane code formatting. But there is also a benefit that is entirely separate and not readily apparent. When looking at other people's Go code on StackOverflow or GitHub, you realize that it looks exactly like your code. It's easy to read and comprehend. And you can copy-paste code snippets from other programs into your own applications without having to change anything! For programmers, this is not the norm, and it feels great - it's the hidden superpower of Go.

When Rob says that everyone loves `gofmt`, he isn't lying. Programmers across the world have taken this concept and ran with it. People now use [rustfmt](https://github.com/rust-lang/rustfmt) in [Rust](https://www.rust-lang.org/), [Black](https://github.com/psf/black) in [Python](https://www.python.org/), and [Prettier](https://prettier.io/) in [JavaScript](https://www.javascript.com/) & [TypeScript](https://www.typescriptlang.org/). <!-- cspell:ignore rustfmt -->

The root of the problem here is that when people try out a new programming language, they often use the same formatting and conventions that they used in their previous language. This fractures the ecosystem and makes everyone's code inconsistent and hard to read. The lesson of Go is that whenever you code in a new language, you should use the standard style that everyone else uses for that language. In this way, every language can have the superpower that Go has.

## Why We Use Prettier & ESLint

### Prettier

In JavaScript and TypeScript land, there isn't an official code formatting standard like there is in Go, but we can get close.

[Prettier](https://prettier.io/) is an auto-formatter for JavaScript/TypeScript. First released in 2017, it has become widespread and is probably considered to be the industry standard in 2023. Prettier works by completely rebuilding your code from scratch using the [AST](https://en.wikipedia.org/wiki/Abstract_syntax_tree), which allows it to make better transformations than other tools.

In `complete-lint`, we choose we choose the Prettier style for code formatting, since it is the most popular TypeScript style. Any ESLint rules that conflict with Prettier are turned off with [`eslint-config-prettier`](https://github.com/prettier/eslint-config-prettier).

Prettier handles almost everything, but the `complete-lint` linting config also has a few formatting-related rules turned on, like [`complete/format-jsdoc-comments`](/eslint-plugin-complete/rules/format-jsdoc-comments) (since Prettier does not format comments).

### ESLint

ESLint is the best tool to lint JavaScript and TypeScript, as it has a massive ecosystem of rules and plugins that can help find errors in your codebase.

With `complete-lint`, the philosophy is that we want to enable as many lint rules as possible, so that we can catch as many bugs as possible. It takes a lot of work to figure out which rules to turn on and which to not bother with, but we've done it for you. This is documented in more detail on [the docs for `eslint-config-complete`](/eslint-config-complete).

### Using Prettier & ESLint Together

In order to avoid running two different tools, we could use [eslint-plugin-prettier](https://github.com/prettier/eslint-plugin-prettier) to run Prettier as an ESLint rule. However, doing this [is not recommended by Prettier](https://prettier.io/docs/en/integrating-with-linters.html). Thus, in order to use `complete-lint`, you should be running both Prettier and ESLint on save. (More info on that is below.)
