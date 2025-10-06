# no-confusing-set-methods

Disallows confusing methods for sets.

<!-- end auto-generated rule header -->

Specifically, this disallows the `Set.keys` and the `Set.entries` methods. These methods serve no purpose and should instead be replaced with the `Set.values` method (or implicit iteration if the set is being used inside of a for loop).

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

## Options

This rule is not configurable.

## Resources

- [How to use this rule](https://complete-ts.github.io/eslint-plugin-complete)
- [Rule source](https://github.com/complete-ts/complete/blob/main/packages/eslint-plugin-complete/src/rules/no-confusing-set-methods.ts)
- [Test source](https://github.com/complete-ts/complete/blob/main/packages/eslint-plugin-complete/tests/rules/no-confusing-set-methods.test.ts)
