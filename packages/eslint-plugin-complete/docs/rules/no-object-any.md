# no-object-any

🚫 This rule is _disabled_ in the ✅ `recommended` config.

Disallows declaring objects and arrays that do not have a type.

<!-- end auto-generated rule header -->

This is useful because the `noImplicitAny` TypeScript compiler flag does not always catch this pattern. If you want to purge all of the `any` from your codebase, you need this rule.

## Rule Details

```ts
// Bad
const myMap = new Map();

// Good
const myMap = new Map<string, string>();
```

```ts
// Bad
const myArray = [];

// Good
const myArray: string[] = [];
```

## Options

This rule is not configurable.

## Resources

- [How to use this rule](https://complete-ts.github.io/eslint-plugin-complete)
- [Rule source](https://github.com/complete-ts/complete/blob/main/packages/eslint-plugin-complete/src/rules/no-object-any.ts)
- [Test source](https://github.com/complete-ts/complete/blob/main/packages/eslint-plugin-complete/tests/rules/no-object-any.test.ts)
