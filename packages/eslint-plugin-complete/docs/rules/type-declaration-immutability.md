# complete/type-declaration-immutability

💼 This rule is enabled in the ✅ `recommended` config.

📝 Enforces that interfaces are immutable.

💭 This rule requires [type information](https://typescript-eslint.io/linting/typed-linting).

<!-- end auto-generated rule header -->

This rule has the same purpose as
[`functional/type-declaration-immutability`](https://github.com/eslint-functional/eslint-plugin-functional/blob/main/docs/rules/type-declaration-immutability.md),
but has no options and requires every interface to be fully immutable. Type
aliases are not checked, and interface names do not affect enforcement.

## Rule Details

```ts
// Bad
interface Foo {
  bar: string;
}

// Good
interface Foo {
  readonly bar: string;
}
```

Deeply immutable `ReadonlyMap`, `ReadonlySet`, and read-only array types are
considered immutable.

## Options

This rule is not configurable.

## Resources

- [How to use this rule](https://complete-ts.github.io/eslint-plugin-complete)
- [Rule source](https://github.com/complete-ts/complete/blob/main/packages/eslint-plugin-complete/src/rules/type-declaration-immutability.ts)
- [Test source](https://github.com/complete-ts/complete/blob/main/packages/eslint-plugin-complete/tests/rules/type-declaration-immutability.test.ts)
