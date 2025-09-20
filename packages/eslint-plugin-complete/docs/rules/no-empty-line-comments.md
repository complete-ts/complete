# `no-empty-line-comments`

Disallows empty line comments (and automatically removes them).

## Rule Details

```ts
// Bad
//

// Bad
//
//

// Good
// This is an non-empty comment. Empty comments are indicative of a mistake.
```

## Options and Defaults

```json
{
  "rules": {
    "complete/no-empty-line-comments": "error"
  }
}
```

This rule is not configurable.

## Resources

- [How to use this rule](https://complete-ts.github.io/eslint-plugin-complete)
- [Rule source](https://github.com/complete-ts/complete/blob/main/packages/eslint-plugin-complete/src/rules/no-empty-line-comments.ts)
- [Test source](https://github.com/complete-ts/complete/blob/main/packages/eslint-plugin-complete/tests/rules/no-empty-line-comments.test.ts)
