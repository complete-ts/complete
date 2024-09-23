# `no-empty-jsdoc`

Disallows empty JSDoc comments (and automatically removes them).

## Rule Details

```ts
// Bad
/** */
```

```ts
// Bad
/**    */
```

```ts
// Bad
/**
 *
 */
```

```ts
// Bad
/**
 *
 *
 *
 */
```

## Options and Defaults

```json
{
  "rules": {
    "complete/no-empty-jsdoc": "error"
  }
}
```

This rule is not configurable.

## Resources

- [How to use this rule](../..)
- [Rule source](https://github.com/complete-ts/complete/blob/main/packages/eslint-plugin-complete/src/rules/no-empty-jsdoc.ts)
- [Test source](https://github.com/complete-ts/complete/blob/main/packages/eslint-plugin-complete/tests/rules/no-empty-jsdoc.test.ts)
