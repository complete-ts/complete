# no-explicit-map-set-loops

Disallows explicit iteration for maps and sets.

<!-- end auto-generated rule header -->

In this case, "explicit iteration" means using a method like `entries` or `values` in a for loop, where omitting the method would result in equivalent code. Forbidding this can make code easier to read.

Also see the [`no-explicit-array-loops`](no-explicit-array-loops.md) rule.

## Rule Details

In JavaScript/TypeScript, you can iterate over map or set elements implicitly:

```ts
for (const [key, value] of myMap) {
}

for (const value of mySet) {
}
```

Or, you can iterate over map or set elements explicitly:

```ts
for (const [key, value] of myMap.entries()) {
}

for (const value of mySet.values()) {
}
```

Idiomatic TypeScript code iterates implicitly. Explicit iteration is rare because it is needlessly verbose. Thus, it is recommended to forbid this pattern in your codebase to prevent confusion and ensure consistency.

## Options

```json
{
  "rules": {
    "complete/no-explicit-map-set-loops": "error"
  }
}
```

This rule is not configurable.

## Resources

- [How to use this rule](https://complete-ts.github.io/eslint-plugin-complete)
- [Rule source](https://github.com/complete-ts/complete/blob/main/packages/eslint-plugin-complete/src/rules/no-explicit-map-set-loops.ts)
- [Test source](https://github.com/complete-ts/complete/blob/main/packages/eslint-plugin-complete/tests/rules/no-explicit-map-set-loops.test.ts)
