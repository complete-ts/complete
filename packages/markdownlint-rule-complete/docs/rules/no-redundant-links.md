# no-redundant-links

Disallows links whose text is identical to their URL.

## Rule Details

When a URL is already the visible text, wrapping it in link syntax adds no information. Use a descriptive label or leave the URL bare.

```md
<!-- Bad -->

[https://example.com](https://example.com)

<!-- Good -->

[Example](https://example.com)

https://example.com
```

## Options

This rule is not configurable.

## Resources

- [How to use this rule](https://complete-ts.github.io/markdownlint-rule-complete)
- [Rule source](https://github.com/complete-ts/complete/blob/main/packages/markdownlint-rule-complete/src/rules/no-redundant-links.ts)
- [Test source](https://github.com/complete-ts/complete/blob/main/packages/markdownlint-rule-complete/tests/no-redundant-links.test.ts)
