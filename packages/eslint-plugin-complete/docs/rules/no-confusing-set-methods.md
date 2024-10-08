# `no-confusing-set-methods`

Disallows the `Set.keys` and the `Set.entries` methods.

These methods serve no purpose and should instead be replaced with the `Set.values` method (or implicit iteration if the set is being used inside of a for loop).

## Rule Details

```ts
// Bad
for (const key of mySet.keys()) {
}
for (const [key, value] of mySet.entries()) {
}

// Good
for (const value of mySet) {
}
```

## Options and Defaults

```json
{
  "rules": {
    "complete/no-confusing-set-methods": "error"
  }
}
```

This rule is not configurable.

## Resources

- [How to use this rule](../..)
- [Rule source](https://github.com/complete-ts/complete/blob/main/packages/eslint-plugin-complete/src/rules/no-confusing-set-methods.ts)
- [Test source](https://github.com/complete-ts/complete/blob/main/packages/eslint-plugin-complete/tests/rules/no-confusing-set-methods.test.ts)
