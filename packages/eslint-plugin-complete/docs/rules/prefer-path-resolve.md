# complete/prefer-path-resolve

💼 This rule is enabled in the ✅ `recommended` config.

📝 Disallows the path.join method with a parent directory segment.

🔧 This rule is automatically fixable by the [`--fix` CLI option](https://eslint.org/docs/latest/user-guide/command-line-interface#--fix).

<!-- end auto-generated rule header -->

## Rule Details

```ts
// Bad
path.join(projectRoot, "..");

// Good
path.resolve(projectRoot, "..");
```

## Options

This rule is not configurable.

## Resources

- [How to use this rule](https://complete-ts.github.io/eslint-plugin-complete)
- [Rule source](https://github.com/complete-ts/complete/blob/main/packages/eslint-plugin-complete/src/rules/prefer-path-resolve.ts)
- [Test source](https://github.com/complete-ts/complete/blob/main/packages/eslint-plugin-complete/tests/rules/prefer-path-resolve.test.ts)
