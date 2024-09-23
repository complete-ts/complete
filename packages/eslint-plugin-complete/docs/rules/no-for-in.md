# `no-for-in`

Disallows "for x in y" statements.

## Rule Details

"for in" loops iterate over the entire prototype chain, which is virtually never what you want. Use a "for of" loop or instead.

```ts
// Bad
const array = [1, 2, 3];
for (const element in array) {
}

// Good
const array = [1, 2, 3];
for (const element of array) {
}

// Bad
const object = { foo: "bar" };
for (const key in object) {
}

// Good
const object = { foo: "bar" };
for (const key of Object.keys(object)) {
}
```

## Options and Defaults

```json
{
  "rules": {
    "complete/no-for-in": "error"
  }
}
```

This rule is not configurable.

## Resources

- [How to use this rule](../..)
- [Rule source](https://github.com/complete-ts/complete/blob/main/packages/eslint-plugin-complete/src/rules/no-for-in.ts)
- [Test source](https://github.com/complete-ts/complete/blob/main/packages/eslint-plugin-complete/tests/rules/no-for-in.test.ts)
