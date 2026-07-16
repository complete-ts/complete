# `markdownlint-config-complete`

[![](https://img.shields.io/npm/v/markdownlint-config-complete.svg)](https://www.npmjs.com/package/markdownlint-config-complete)

## Introduction

This is a sharable configuration for [markdownlint](https://github.com/DavidAnson/markdownlint). It disables rules that are redundant with [Prettier](https://prettier.io/) or do not provide enough value for typical Markdown projects.

## Install

For example, if you use the [npm](https://docs.npmjs.com/cli/commands/npm) package manager:

```sh
npm install --save-dev markdownlint-cli2 markdownlint-config-complete
```

## Usage

Add the package name to the `extends` property inside of `config` in `.markdownlint-cli2.jsonc`:

```jsonc
{
  "config": {
    "extends": "markdownlint-config-complete",
  },
}
```

Project-specific settings override the shared config:

```jsonc
{
  "config": {
    "extends": "markdownlint-config-complete",
    "MD013": true,
  },
}
```

Custom rules are distributed separately by [`markdownlint-rule-complete`](/markdownlint-rule-complete). Both packages can be used together:

```jsonc
{
  "config": {
    "extends": "markdownlint-config-complete",
  },
  "customRules": ["markdownlint-rule-complete"],
}
```

## Disabled Rules

- `MD009` (trailing spaces): Prettier handles this check.
- `MD010` (hard tabs): Prettier handles this check.
- `MD012` (multiple consecutive blank lines): Prettier handles this check.
- `MD013` (line length): Prettier does not automatically break long Markdown lines, so an arbitrary limit is undesirable.
- `MD022` (headings should be surrounded by blank lines): Prettier handles this check.
- `MD031` (fenced code blocks should be surrounded by blank lines): Prettier handles this check.
- `MD032` (lists should be surrounded by blank lines): Prettier handles this check.
- `MD034` (bare URLs): GitHub and Docusaurus convert bare URLs into links.
- `MD045` (images should have alternate text): The maintenance burden of alternate text outweighs its advantages.
- `MD047` (files should end with a single newline): Prettier handles this check.
- `MD060` (table column style): Prettier handles this check.
