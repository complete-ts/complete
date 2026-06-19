# complete/prefer-unknown-type-annotations

💼 This rule is enabled in the ✅ `recommended` config.

📝 Require variable type annotations over as unknown assertions.

🔧 This rule is automatically fixable by the [`--fix` CLI option](https://eslint.org/docs/latest/user-guide/command-line-interface#--fix).

<!-- end auto-generated rule header -->

Require variable type annotations over as unknown assertions.

## Rule Details

```ts
// Bad
const foo = JSON.parse(fooContents) as unknown;

// Good
const foo: unknown = JSON.parse(fooContents);
```

## Options

This rule is not configurable.

## Resources

- [How to use this rule](https://complete-ts.github.io/eslint-plugin-complete)
- [Rule source](https://github.com/complete-ts/complete/blob/main/packages/eslint-plugin-complete/src/rules/prefer-unknown-type-annotations.ts)
- [Test source](https://github.com/complete-ts/complete/blob/main/packages/eslint-plugin-complete/tests/rules/prefer-unknown-type-annotations.test.ts)
