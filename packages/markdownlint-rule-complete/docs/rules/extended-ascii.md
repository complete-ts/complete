# extended-ascii

Requires text to contain only ASCII characters, with limited exceptions.

## Rule Details

This rule reports non-ASCII characters in regular text. However, the check mark, cross mark, and box-drawing characters are allowed.

```md
<!-- Bad -->

“Smart quotes”

<!-- Good -->

"Straight quotes"
```

## Options

This rule is not configurable.

## Resources

- [How to use this rule](https://complete-ts.github.io/markdownlint-rule-complete)
- [Rule source](https://github.com/complete-ts/complete/blob/main/packages/markdownlint-rule-complete/src/rules/extended-ascii.ts)
- [Test source](https://github.com/complete-ts/complete/blob/main/packages/markdownlint-rule-complete/tests/extended-ascii.test.ts)
