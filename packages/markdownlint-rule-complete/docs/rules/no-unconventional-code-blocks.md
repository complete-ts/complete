# no-unconventional-code-blocks

Requires conventional language identifiers for fenced code blocks.

## Rule Details

This rule automatically replaces `bash` with `sh`, `console` with `powershell`, and `text` with `txt`.

````md
<!-- Bad -->

```bash
echo "Hello"
```

<!-- Good -->

```sh
echo "Hello"
```
````

## Options

This rule is not configurable.

## Resources

- [How to use this rule](https://complete-ts.github.io/markdownlint-rule-complete)
- [Rule source](https://github.com/complete-ts/complete/blob/main/packages/markdownlint-rule-complete/src/rules/no-unconventional-code-blocks.ts)
- [Test source](https://github.com/complete-ts/complete/blob/main/packages/markdownlint-rule-complete/tests/no-unconventional-code-blocks.test.ts)
