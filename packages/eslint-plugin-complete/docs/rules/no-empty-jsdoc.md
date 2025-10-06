# no-empty-jsdoc

💼 This rule is enabled in the ✅ `recommended` config.

Disallows empty JSDoc comments (and automatically removes them).

<!-- end auto-generated rule header -->

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

## Options

This rule is not configurable.

## Resources

- [How to use this rule](https://complete-ts.github.io/eslint-plugin-complete)
- [Rule source](https://github.com/complete-ts/complete/blob/main/packages/eslint-plugin-complete/src/rules/no-empty-jsdoc.ts)
- [Test source](https://github.com/complete-ts/complete/blob/main/packages/eslint-plugin-complete/tests/rules/no-empty-jsdoc.test.ts)
