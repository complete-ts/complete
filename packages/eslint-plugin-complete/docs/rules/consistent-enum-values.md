# consistent-enum-values

Requires consistent enum values.

<!-- end auto-generated rule header -->

Specifically, it requires that all enum values exactly match the enum name, like this:

```ts
enum Foo {
  Value1 = "Value1",
  Value2 = "Value2",
  Value3 = "Value3",
}
```

## Rule Details

Use this rule to enforce a consistent enum style throughout your codebase.

This rule only enforces the naming style for string enums. Thus, you should use this rule in conjunction with the [`complete/no-number-enums`](no-number-enums.md) rule and the [`@typescript-eslint/prefer-enum-initializers`](https://typescript-eslint.io/rules/prefer-enum-initializers/) rule to prevent all number enums.

```ts
// Bad
enum Foo {
  Value1 = "VALUE1",
}

// Good
enum Foo {
  Value1 = "Value1",
}
```

## Justification

In pure TypeScript programs, the values of an enum are superfluous: they should not affect the runtime behavior of the program in any way. Thus, the values that you select for your enums are purely be a stylistic concern.

Thus, it follows that the simplest and most maintainable solution would be to use the "computed" enum value feature of TypeScript, like this:

```ts
enum Foo {
  Value1,
  Value2,
  Value3,
}
```

Unfortunately, this feature results in numeric values instead of string values. And the TypeScript compiler is not as strict with number enums as it is with string enums. Thus, in order to get the maximum guarantees of safety in our programs, we want to use string enums instead of number enums, and therefore cannot use the computed values feature.

The next simplest and easiest-to-maintain solution is to simply copy the values of the the enum exactly. Thus, this lint rule enforces this style.

## Options

This rule is not configurable.

## Resources

- [How to use this rule](https://complete-ts.github.io/eslint-plugin-complete)
- [Rule source](https://github.com/complete-ts/complete/blob/main/packages/eslint-plugin-complete/src/rules/consistent-enum-values.ts)
- [Test source](https://github.com/complete-ts/complete/blob/main/packages/eslint-plugin-complete/tests/rules/consistent-enum-values.test.ts)
