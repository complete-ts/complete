# no-string-length-0

💼 This rule is enabled in the ✅ `recommended` config.

Disallows checking for empty strings via the length method in favor of direct comparison to an empty string.

💭 This rule requires [type information](https://typescript-eslint.io/linting/typed-linting).

<!-- end auto-generated rule header -->

This is helpful since the latter is shorter and easier to read.

## Rule Details

```ts
// Bad
declare const foo: string;
if (foo.length === 0) {
}

// Good
declare const foo: string;
if (foo === "") {
}
```

## Options

This rule is not configurable.

## Resources

- [How to use this rule](https://complete-ts.github.io/eslint-plugin-complete)
- [Rule source](https://github.com/complete-ts/complete/blob/main/packages/eslint-plugin-complete/src/rules/no-string-length-0.ts)
- [Test source](https://github.com/complete-ts/complete/blob/main/packages/eslint-plugin-complete/tests/rules/no-string-length-0.test.ts)
