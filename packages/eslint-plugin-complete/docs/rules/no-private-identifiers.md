# complete/no-private-identifiers

💼 This rule is enabled in the ✅ `recommended` config.

📝 Disallows # private members in favor of the TypeScript private modifier.

<!-- end auto-generated rule header -->

## Rule Details

Use the TypeScript `private` modifier instead of JavaScript `#` private members.
This rule reports every private identifier, including fields, methods,
accessors, member accesses, and private brand checks such as `#value in object`.

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

This rule does not provide an automatic fix. JavaScript `#` private members
enforce privacy at runtime, while the TypeScript `private` modifier only
enforces privacy during type checking. Converting between them can change
program behavior.

## Options

This rule is not configurable.

## Resources

- [How to use this rule](https://complete-ts.github.io/eslint-plugin-complete)
- [Rule source](https://github.com/complete-ts/complete/blob/main/packages/eslint-plugin-complete/src/rules/no-private-identifiers.ts)
- [Test source](https://github.com/complete-ts/complete/blob/main/packages/eslint-plugin-complete/tests/rules/no-private-identifiers.test.ts)
