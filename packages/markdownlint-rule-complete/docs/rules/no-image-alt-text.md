# no-image-alt-text

Disallows image alt text.

## Rule Details

This opinionated rule requires empty image labels and automatically removes their contents.

```md
<!-- Bad -->

![Logo](logo.png)

<!-- Good -->

![](logo.png)
```

## Options

This rule is not configurable.

## Resources

- [How to use this rule](https://complete-ts.github.io/markdownlint-rule-complete)
- [Rule source](https://github.com/complete-ts/complete/blob/main/packages/markdownlint-rule-complete/src/rules/no-image-alt-text.ts)
- [Test source](https://github.com/complete-ts/complete/blob/main/packages/markdownlint-rule-complete/tests/no-image-alt-text.test.ts)
