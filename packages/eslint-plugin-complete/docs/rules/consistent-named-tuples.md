# `consistent-named-tuples`

Requires that if one or more tuple elements are named, all of them are named.

## Rule Details

```ts
// Bad
type MyTuple = [arg1: string, number];

// Good
type MyTuple = [arg1: string, arg2: number];
```

## Options and Defaults

```json
{
  "rules": {
    "complete/consistent-named-tuples": "error"
  }
}
```

This rule is not configurable.

## Resources

- [How to use this rule](../..)
- [Rule source](https://github.com/complete-ts/complete/blob/main/packages/eslint-plugin-complete/src/rules/consistent-named-tuples.ts)
- [Test source](https://github.com/complete-ts/complete/blob/main/packages/eslint-plugin-complete/tests/rules/consistent-named-tuples.test.ts)
