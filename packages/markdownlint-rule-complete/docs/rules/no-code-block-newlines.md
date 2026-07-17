# no-code-block-newlines

Disallows leading and trailing blank lines inside fenced code blocks.

## Rule Details

This rule automatically removes blank lines immediately after an opening fence or immediately before a closing fence.

````md
<!-- Bad -->

```txt

hello

```

<!-- Good -->

```txt
hello
```
````

## Options

This rule is not configurable.

## Resources

- [How to use this rule](https://complete-ts.github.io/markdownlint-rule-complete)
- [Rule source](https://github.com/complete-ts/complete/blob/main/packages/markdownlint-rule-complete/src/rules/no-code-block-newlines.ts)
- [Test source](https://github.com/complete-ts/complete/blob/main/packages/markdownlint-rule-complete/tests/no-code-block-newlines.test.ts)
