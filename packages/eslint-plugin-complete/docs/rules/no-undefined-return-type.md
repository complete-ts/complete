# no-undefined-return-type

Disallows `undefined` return types on functions.

<!-- end auto-generated rule header -->

## Rule Details

A function that only returns `undefined` is confusing and likely to be a mistake, since a function that returns nothing should have a return type of `void`.

```ts
// Bad
function foo(): undefined {
  return;
}

// Good
function foo(): void {
  return;
}

// Bad
function foo() {
  return undefined;
}

// Good
function foo() {
  return;
}
```

## Options

This rule is not configurable.

## Resources

- [How to use this rule](https://complete-ts.github.io/eslint-plugin-complete)
- [Rule source](https://github.com/complete-ts/complete/blob/main/packages/eslint-plugin-complete/src/rules/no-undefined-return-type.ts)
- [Test source](https://github.com/complete-ts/complete/blob/main/packages/eslint-plugin-complete/tests/rules/no-undefined-return-type.test.ts)
