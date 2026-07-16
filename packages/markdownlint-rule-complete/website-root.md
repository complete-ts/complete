# `markdownlint-rule-complete`

[![npm version](https://img.shields.io/npm/v/markdownlint-rule-complete.svg)](https://www.npmjs.com/package/markdownlint-rule-complete)

`markdownlint-rule-complete` is a collection of opinionated custom rules for [`markdownlint`](https://github.com/DavidAnson/markdownlint).

## Installation

```sh
npm install --save-dev markdownlint-rule-complete
```

## Usage

Add the package name to the `customRules` array in `.markdownlint-cli2.jsonc`:

```jsonc
{
  "customRules": ["markdownlint-rule-complete"],
}
```

The package enables these rules:

- `extended-ascii`
- `no-bold-headers`
- `no-code-block-newlines`
- `no-cspell-words`
- `no-horizontal-rules`
- `no-image-alt-text`
- `no-redundant-links`
- `no-space-before-punctuation`
- `no-unconventional-code-blocks`
