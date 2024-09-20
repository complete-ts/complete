# `eslint-config-complete`

[![npm version](https://img.shields.io/npm/v/eslint-config-complete.svg)](https://www.npmjs.com/package/eslint-config-complete)

## Introduction

This is a sharable configuration for [ESLint](https://eslint.org/) that is intended to be used in TypeScript projects that want to be as safe as possible.

The config is environment-agnostic, meaning that it will work in client-side projects (e.g. React), server-side projects (e.g. Node.js), and so on.

## Install

### Using `complete-lint`

This package is part of the [`complete-lint`](/complete-lint) meta-linting package. It is recommended that instead of consuming `eslint-config-complete` directly, you instead list `complete-lint` as a dependency, as that will install both this config and other goodies. (However, `complete-lint` will not work with the [pnpm](https://pnpm.io/) package manager, since it does not handle transitive dependencies properly.)

For installation instructions, see [the `complete-lint` page](/complete-lint).

### Manually

If you do not want to use the `complete-lint` meta-package, then you can install this config manually:

```sh
npm install --save-dev eslint typescript eslint-plugin-complete
```

(`eslint` and `typescript` are peer-dependencies.)

## Usage

Here's an example "eslint.config.mjs" file that loads the base config:

```js
// @ts-check

import { completeConfigBase } from "eslint-config-complete";
import tseslint from "typescript-eslint";

export default tseslint.config(...completeConfigBase);
```

If you have a monorepo, you might also want to load the monorepo config:

```js
// @ts-check

import {
  completeConfigBase,
  completeConfigMonorepo,
} from "eslint-config-complete";
import tseslint from "typescript-eslint";

export default tseslint.config(
  ...completeConfigBase,
  ...completeConfigMonorepo,
);
```

## Why Do I Need To Use ESLint?

If you are reading this page, you are likely a user of [TypeScript](https://www.typescriptlang.org/). As you probably know, TypeScript is great because it saves you an enormous amount of time. The hours spent troubleshooting run-time errors caused from small typos have become a thing of the past. Good riddance!

But there are many other code problems that do not have to do with types. In the same way that you want to use TypeScript to catch as many bugs as possible, you also want to use ESLint with a config that enables lots of good linting rules to catch even more bugs.

ESLint rules can help catch bugs, but they can also help to make your codebase more consistent and adhere to best-practices within the TypeScript ecosystem. Remember that [code is read more often than it is written](https://skeptics.stackexchange.com/questions/48560/is-code-read-more-often-than-its-written). If you care about your code being the best that it can possibly be, then using ESLint is a must!

## Why Do I Need `eslint-config-complete`?

`eslint-config-complete` is one of the most comprehensive ESLint configs out there.

Building an ESLint config from scratch takes many, many hours. ESLint has [over 250 rules](https://github.com/eslint/eslint/blob/main/packages/js/src/configs/eslint-all.js). `typescript-eslint` has [over 125 rules](https://github.com/typescript-eslint/typescript-eslint/blob/main/packages/eslint-plugin/src/configs/all.ts). And that's just the beginning.

Don't bother creating and maintaining a huge ESLint config yourself. We've done the work to:

- Enable every ESLint rule that we can find from trusted sources that provides value.
- Weed out the rules that don't apply to TypeScript codebases (because many ESLint rules were written before TypeScript existed).
- Weed out the rules covered by [Prettier](https://prettier.io/) (because many ESLint rules were written before Prettier existed).
- Weed out the rules that are too noisy to provide value (and document them below).

## Our Config Philosophy

We want to enable as many lint rules as possible, so that we can catch as many bugs as possible. Of course, this is a tradeoff: with more lint rules, we get more false positives. But in general, a few false positives are worth the time saved from investigating and squashing bugs. (More on false positives [later](#dealing-with-false-positives).)

In line with this philosophy, our linting config enables nearly all of the recommended rules from both the core ESLint team and the TypeScript ESLint team, as well as some additional rules that catch even more bugs.

This config also assumes that you are using [Prettier](https://prettier.io/) to format your TypeScript code, which is considered to be best-practice in the ecosystem. Subsequently, all formatting-related rules that conflict with Prettier are disabled. (However, we use a few formatting-related rules that are not handled by Prettier.)

## Auto-Fixing

Deploying this ESLint config on an existing codebase can generate a ton of warnings. Fixing them all might seem overwhelming. While some warnings need to be fixed manually, a ton of ESLint rules have "auto-fixers". This means that the code will fix itself if you run ESLint with the `--fix` flag. So, by running `npx eslint --fix .` in the root of your project, you can take care of a lot of the warnings automatically.

Additionally, we recommend that you [configure your IDE (i.e. VSCode) to automatically run `--fix` whenever you save a file](/complete-lint#step-4---editor-integration).

## Dealing with False Positives

Your first reaction to having a bunch of yellow squiggly lines might be to disable any rule that gets in your way. However, even if you think an ESLint warning is superfluous, it is often a sign that your codebase is structured in a bug-prone or non-idiomatic way. Before simply disabling a rule, sometimes it is good to do some research and think carefully if your code can be refactored in some way to be cleaner.

Additionally, some ESLint rules are not about catching bugs, but are about code style and code consistency. If you find the new style to be foreign and weird, it can be tempting to ignore or disable the rule. But before you do that, consider the cost: your codebase will be deviating from others in the TypeScript ecosystem. It is [really nice for everyone's code to adhere to the same look and the same standards](/complete-lint#why-code-formatting-is-important)!

With that said, with so many ESLint rules turned on, you will undoubtedly come across some false positives. You can quickly take care of these by adding a `// eslint-disable-next-line insert-rule-name-here` comment. And you can automatically add the comment by selecting "Quick Fix" in VSCode, which is mapped to `Ctrl + .` by default.

If you find yourself adding a lot of disable comments for a specific rule, then turn the rule off for the entire project by adding an entry for it in your `eslint.config.mjs` file. Some rules won't make sense for every project and that's okay!

## Rule List

Below, we provide documentation for every rule that is disabled. (We take a blacklist approach rather than a whitelist approach.)

<!-- Do not manually modify the RULES_TABLE section. Instead, run: npm run docs -->
<!-- markdownlint-disable MD033 -->
<!-- RULES_TABLE -->

<!-- /RULES_TABLE -->
