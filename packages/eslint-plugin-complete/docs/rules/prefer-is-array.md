# complete/prefer-is-array

💼 This rule is enabled in the ✅ `recommended` config.

📝 Requires using the complete-common isArray helper instead of Array.isArray.

💭 This rule requires [type information](https://typescript-eslint.io/linting/typed-linting).

<!-- end auto-generated rule header -->

The `Array.isArray` function is the standard way in JavaScript/TypeScript to check if something is an array. However, the return type for it is `arg is any[]`. This is bad, because `any` disables the type-checker. Thus, this rule forces you to use the `isArray` helper function from the `complete-common` library, which is the same thing as the `Array.isArray` function, but has a proper return type of `arg is unknown[]`.

## Rule Details

```ts
// Bad
if (Array.isArray()) {
}

// Good
if (isArray()) {
}
```

## Options

This rule is not configurable.

## Resources

- [How to use this rule](https://complete-ts.github.io/eslint-plugin-complete)
- [Rule source](https://github.com/complete-ts/complete/blob/main/packages/eslint-plugin-complete/src/rules/prefer-is-array.ts)
- [Test source](https://github.com/complete-ts/complete/blob/main/packages/eslint-plugin-complete/tests/rules/prefer-is-array.test.ts)
