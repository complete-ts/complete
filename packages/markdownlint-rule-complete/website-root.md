# `markdownlint-rule-complete`

[![](https://img.shields.io/npm/v/markdownlint-rule-complete.svg)](https://www.npmjs.com/package/markdownlint-rule-complete)

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

## Rules

| Name                                                                                             | Description                                                             | Fixable |
| ------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------- | ------- |
| [extended-ascii](/markdownlint-rule-complete/rules/extended-ascii)                               | Requires text to contain only ASCII characters, with limited exceptions |         |
| [no-bold-headers](/markdownlint-rule-complete/rules/no-bold-headers)                             | Disallows bold text in headings                                         | Yes     |
| [no-code-block-newlines](/markdownlint-rule-complete/rules/no-code-block-newlines)               | Disallows leading and trailing blank lines inside fenced code blocks    | Yes     |
| [no-cspell-words](/markdownlint-rule-complete/rules/no-cspell-words)                             | Disallows CSpell `words` directives                                     |         |
| [no-horizontal-rules](/markdownlint-rule-complete/rules/no-horizontal-rules)                     | Disallows horizontal rules                                              | Yes     |
| [no-image-alt-text](/markdownlint-rule-complete/rules/no-image-alt-text)                         | Disallows image alt text                                                | Yes     |
| [no-redundant-links](/markdownlint-rule-complete/rules/no-redundant-links)                       | Disallows links whose text is identical to their URL                    |         |
| [no-space-before-punctuation](/markdownlint-rule-complete/rules/no-space-before-punctuation)     | Disallows spaces before periods and commas                              | Yes     |
| [no-unconventional-code-blocks](/markdownlint-rule-complete/rules/no-unconventional-code-blocks) | Requires conventional language identifiers for fenced code blocks       | Yes     |
