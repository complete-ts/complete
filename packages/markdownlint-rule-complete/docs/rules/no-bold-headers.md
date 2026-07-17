# no-bold-headers

Disallows bold text in headings.

## Rule Details

Heading syntax already gives text visual emphasis, so additional bold formatting is redundant. This rule automatically removes bold markers from headings.

```md
<!-- Bad -->

# **Heading**

<!-- Good -->

# Heading
```

## Options

This rule is not configurable.

## Resources

- [How to use this rule](https://complete-ts.github.io/markdownlint-rule-complete)
- [Rule source](https://github.com/complete-ts/complete/blob/main/packages/markdownlint-rule-complete/src/rules/no-bold-headers.ts)
- [Test source](https://github.com/complete-ts/complete/blob/main/packages/markdownlint-rule-complete/tests/no-bold-headers.test.ts)
