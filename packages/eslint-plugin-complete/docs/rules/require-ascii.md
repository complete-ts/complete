# complete/require-ascii

💼 This rule is enabled in the ✅ `recommended` config.

📝 Require code and comments to only contain ASCII characters.

⚙️ This rule is configurable.

<!-- end auto-generated rule header -->

Require code and comments to only contain ASCII characters. If this is too restrictive, you can use the `whitelist` option to allow specific characters.

## Rule Details

```ts
// Bad
const name = "Αlice"; // Greek letter A (0x391), which is indistinguishable from a normal A.

// Good
const name = "Alice"; // Normal A
```

## Options

```json
{
  "rules": {
    "complete/require-ascii": [
      "error",
      {
        "whitelist": []
      }
    ]
  }
}
```

## Resources

- [How to use this rule](https://complete-ts.github.io/eslint-plugin-complete)
- [Rule source](https://github.com/complete-ts/complete/blob/main/packages/eslint-plugin-complete/src/rules/require-ascii.ts)
- [Test source](https://github.com/complete-ts/complete/blob/main/packages/eslint-plugin-complete/tests/rules/require-ascii.test.ts)
