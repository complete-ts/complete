# no-space-before-punctuation

Disallows spaces before periods and commas.

## Rule Details

This rule reports one or more spaces immediately before a period or comma at the end of a text segment and automatically removes them. Code blocks and punctuation followed directly by another non-whitespace character are ignored.

```md
<!-- Bad -->

Hello , world .

<!-- Good -->

Hello, world.
```

## Options

This rule is not configurable.

## Resources

- [How to use this rule](https://complete-ts.github.io/markdownlint-rule-complete)
- [Rule source](https://github.com/complete-ts/complete/blob/main/packages/markdownlint-rule-complete/src/rules/no-space-before-punctuation.ts)
- [Test source](https://github.com/complete-ts/complete/blob/main/packages/markdownlint-rule-complete/tests/no-space-before-punctuation.test.ts)
