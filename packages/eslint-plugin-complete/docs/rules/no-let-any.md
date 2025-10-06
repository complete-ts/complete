# no-let-any

Disallows declaring variables with let that do not have a type.

<!-- end auto-generated rule header -->

This is useful because the `noImplicitAny` TypeScript compiler flag does not always catch this pattern. If you want to purge all of the `any` from your codebase, you need this rule.

## Rule Details

```ts
// Bad
let foo;

// Good
let foo: string;
```

## Options

```json
{
  "rules": {
    "complete/no-let-any": "error"
  }
}
```

This rule is not configurable.

## Resources

- [How to use this rule](https://complete-ts.github.io/eslint-plugin-complete)
- [Rule source](https://github.com/complete-ts/complete/blob/main/packages/eslint-plugin-complete/src/rules/no-let-any.ts)
- [Test source](https://github.com/complete-ts/complete/blob/main/packages/eslint-plugin-complete/tests/rules/no-let-any.test.ts)
