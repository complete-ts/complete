# complete/no-empty-line-comments

💼 This rule is enabled in the ✅ `recommended` config.

📝 Disallows empty line comments (and automatically removes them).

🔧 This rule is automatically fixable by the [`--fix` CLI option](https://eslint.org/docs/latest/user-guide/command-line-interface#--fix).

<!-- end auto-generated rule header -->

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

## Options

This rule is not configurable.

## Resources

- [How to use this rule](https://complete-ts.github.io/eslint-plugin-complete)
- [Rule source](https://github.com/complete-ts/complete/blob/main/packages/eslint-plugin-complete/src/rules/no-empty-line-comments.ts)
- [Test source](https://github.com/complete-ts/complete/blob/main/packages/eslint-plugin-complete/tests/rules/no-empty-line-comments.test.ts)
