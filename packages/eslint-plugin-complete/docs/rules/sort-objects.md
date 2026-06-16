# complete/sort-objects

💼 This rule is enabled in the ✅ `recommended` config.

📝 Requires object properties to match the declared type order.

🔧 This rule is automatically fixable by the [`--fix` CLI option](https://eslint.org/docs/latest/user-guide/command-line-interface#--fix).

💭 This rule requires [type information](https://typescript-eslint.io/linting/typed-linting).

<!-- end auto-generated rule header -->

Requires object literal properties to match the declared type order.

## Rule Details

```ts
interface Foo {
  name: string;
  description: string;
}

// Bad
const foo: Foo = {
  description: "A foo.",
  name: "foo",
};

// Good
const foo: Foo = {
  name: "foo",
  description: "A foo.",
};
```

## Options

This rule is not configurable.

## Resources

- [How to use this rule](https://complete-ts.github.io/eslint-plugin-complete)
- [Rule source](https://github.com/complete-ts/complete/blob/main/packages/eslint-plugin-complete/src/rules/sort-objects.ts)
- [Test source](https://github.com/complete-ts/complete/blob/main/packages/eslint-plugin-complete/tests/rules/sort-objects.test.ts)
