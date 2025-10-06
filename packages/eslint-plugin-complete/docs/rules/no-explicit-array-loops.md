# no-explicit-array-loops

Disallows explicit iteration for arrays.

<!-- end auto-generated rule header -->

In this case, "explicit iteration" means using the `values` method (or `Object.values`) in a for loop. Forbidding this can make code easier to read.

Also see the [`no-explicit-map-set-loops`](no-explicit-map-set-loops.md) rule.

## Rule Details

In JavaScript/TypeScript, you can iterate over array elements implicitly:

```ts
for (const element of myArray) {
}
```

Or, you can iterate over array elements explicitly:

```ts
for (const element of myArray.values()) {
}
```

Idiomatic TypeScript code iterates implicitly. Explicit iteration is rare because it is needlessly verbose. Thus, it is recommended to forbid this pattern in your codebase to prevent confusion and ensure consistency.

## Options

```json
{
  "rules": {
    "complete/no-explicit-array-loops": "error"
  }
}
```

This rule is not configurable.

## Resources

- [How to use this rule](https://complete-ts.github.io/eslint-plugin-complete)
- [Rule source](https://github.com/complete-ts/complete/blob/main/packages/eslint-plugin-complete/src/rules/no-explicit-array-loops.ts)
- [Test source](https://github.com/complete-ts/complete/blob/main/packages/eslint-plugin-complete/tests/rules/no-explicit-array-loops.test.ts)
