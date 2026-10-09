# complete/no-private-identifiers

💼 This rule is enabled in the ✅ `recommended` config.

📝 Disallows # private members in favor of the TypeScript private modifier.

<!-- end auto-generated rule header -->

## Rule Details

For TypeScript projects, using `private` instead of `#` is superior in a few
ways.
[This blog](https://github.com/typescript-eslint/typescript-eslint/issues/4571#issuecomment-1272609077)
goes into more detail.

```ts
// Bad
class Foo {
  #value = 1;

  #getValue() {
    return this.#value;
  }
}

// Good
class Foo {
  private value = 1;

  private getValue() {
    return this.value;
  }
}
```

## Options

This rule is not configurable.

## Resources

- [How to use this rule](https://complete-ts.github.io/eslint-plugin-complete)
- [Rule source](https://github.com/complete-ts/complete/blob/main/packages/eslint-plugin-complete/src/rules/no-private-identifiers.ts)
- [Test source](https://github.com/complete-ts/complete/blob/main/packages/eslint-plugin-complete/tests/rules/no-private-identifiers.test.ts)
