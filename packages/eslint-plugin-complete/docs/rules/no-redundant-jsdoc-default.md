# complete/no-redundant-jsdoc-default

💼 This rule is enabled in the ✅ `recommended` config.

📝 Disallows setting object properties to their JSDoc default values.

💭 This rule requires [type information](https://typescript-eslint.io/linting/typed-linting).

<!-- end auto-generated rule header -->

Disallows setting object properties to their JSDoc default values. This catches redundant
configuration such as explicitly setting a property to `true` when its type declaration documents
`@default true`.

## Rule Details

```ts
interface Foo {
  /**
   * @default true
   */
  readonly someProp?: boolean;
}

// Bad
const foo: Foo = {
  someProp: true,
};

// Good
const foo: Foo = {};
const foo: Foo = {
  someProp: false,
};
```

## Options

This rule is not configurable.

## Resources

- [How to use this rule](https://complete-ts.github.io/eslint-plugin-complete)
- [Rule source](https://github.com/complete-ts/complete/blob/main/packages/eslint-plugin-complete/src/rules/no-redundant-jsdoc-default.ts)
- [Test source](https://github.com/complete-ts/complete/blob/main/packages/eslint-plugin-complete/tests/rules/no-redundant-jsdoc-default.test.ts)
