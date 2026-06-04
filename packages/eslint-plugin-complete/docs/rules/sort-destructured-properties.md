# complete/sort-destructured-properties

💼 This rule is enabled in the ✅ `recommended` config.

📝 Requires destructured object properties to match the declared type order.

🔧 This rule is automatically fixable by the [`--fix` CLI option](https://eslint.org/docs/latest/user-guide/command-line-interface#--fix).

💭 This rule requires [type information](https://typescript-eslint.io/linting/typed-linting).

<!-- end auto-generated rule header -->

Requires destructured object properties to match the declared type order.

Note that this rule [was proposed to TSESLint](https://github.com/typescript-eslint/typescript-eslint/issues/6893), but was rejected.

## Rule Details

```ts
interface Foo {
  name: string;
  description: string;
}

// Bad
declare const foo: Foo;
const { description, name } = foo;

// Good
declare const foo: Foo;
const { name, description } = foo;
```

## Options

This rule is not configurable.

## Resources

- [How to use this rule](https://complete-ts.github.io/eslint-plugin-complete)
- [Rule source](https://github.com/complete-ts/complete/blob/main/packages/eslint-plugin-complete/src/rules/sort-destructured-properties.ts)
- [Test source](https://github.com/complete-ts/complete/blob/main/packages/eslint-plugin-complete/tests/rules/sort-destructured-properties.test.ts)
