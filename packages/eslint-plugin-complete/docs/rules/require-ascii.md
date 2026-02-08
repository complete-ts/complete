# complete/require-ascii

💼 This rule is enabled in the ✅ `recommended` config.

📝 Require code and comments to only contain ASCII characters.

<!-- end auto-generated rule header -->

Require code and comments to only contain ASCII characters.

## Rule Details

<!-- cspell:words Αlice -->

```ts
// Bad
const name = "Αlice"; // Alice with a Greek letter A (0x391)

// Good
const name = "Alice"; // Normal A
```

## Options

This rule is not configurable.

## Resources

- [How to use this rule](https://complete-ts.github.io/eslint-plugin-complete)
- [Rule source](https://github.com/complete-ts/complete/blob/main/packages/eslint-plugin-complete/src/rules/require-ascii.ts)
- [Test source](https://github.com/complete-ts/complete/blob/main/packages/eslint-plugin-complete/tests/rules/require-ascii.test.ts)
