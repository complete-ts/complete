# complete/consistent-object-braces

💼 This rule is enabled in the ✅ `recommended` config.

📝 Requires object brace spacing to match the property count.

🔧 This rule is automatically fixable by the [`--fix` CLI option](https://eslint.org/docs/latest/user-guide/command-line-interface#--fix).

<!-- end auto-generated rule header -->

Object literals with one property must be on one line. Object literals with two or more properties must put each property on its own line. This rule preserves existing trailing commas; Prettier should be responsible for adding or removing them.

This rule applies to object expressions, such as object literals assigned to variables, nested inside other objects, or passed as function arguments. It does not apply to object patterns, such as destructuring assignments or function parameters.

## Rule Details

```ts
// Bad
const foo = {
  bar,
};

const baz = { one, two };

// Good
const foo = { bar };

const baz = {
  one,
  two,
};
```

This rule does not report destructuring patterns:

```ts
const { foo } = bar;

function foo({ bar }: Baz) {}
```

## Options

This rule is not configurable.

## Resources

- [How to use this rule](https://complete-ts.github.io/eslint-plugin-complete)
- [Rule source](https://github.com/complete-ts/complete/blob/main/packages/eslint-plugin-complete/src/rules/consistent-object-braces.ts)
- [Test source](https://github.com/complete-ts/complete/blob/main/packages/eslint-plugin-complete/tests/rules/consistent-object-braces.test.ts)
