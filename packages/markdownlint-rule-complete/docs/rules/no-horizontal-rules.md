# no-horizontal-rules

Disallows horizontal rules.

## Rule Details

Horizontal rules create visual structure without describing the relationship between sections. Prefer headings to organize content. This rule automatically removes horizontal rules.

```md
<!-- Bad -->

First section

---

Second section

<!-- Good -->

## First Section

## Second Section
```

## Options

This rule is not configurable.

## Resources

- [How to use this rule](https://complete-ts.github.io/markdownlint-rule-complete)
- [Rule source](https://github.com/complete-ts/complete/blob/main/packages/markdownlint-rule-complete/src/rules/no-horizontal-rules.ts)
- [Test source](https://github.com/complete-ts/complete/blob/main/packages/markdownlint-rule-complete/tests/no-horizontal-rules.test.ts)
