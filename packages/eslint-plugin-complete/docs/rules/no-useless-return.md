# complete/no-useless-return

💼 This rule is enabled in the ✅ `recommended` config.

📝 Disallows redundant return statements (with no auto-fixer).

<!-- end auto-generated rule header -->

This is the exact same thing as the ESLint [`no-useless-return`](https://eslint.org/docs/latest/rules/no-useless-return) rule, except the auto-fixer is disabled.

## Rule Details

This version of the rule without an auto-fixer is useful because it is common during development to comment out code after an [early return](https://medium.com/swlh/return-early-pattern-3d18a41bba8). In these cases, the auto-fixer is harmful, since it would require us to manually go put the return statement back after uncommenting the code.

## Gotchas

If you use this rule, make sure to turn off the vanilla ESLint rule, like this:

```json
{
  "rules": {
    "no-useless-return": "off"
  }
}
```

Otherwise, the two rules will conflict with each other.

Note that if you use the `recommended` config that comes with this plugin, then the vanilla ESLint rule will be turned off automatically.

## Options

This rule is not configurable. (All of the unsafe options from the original have been removed.)

## Resources

- [How to use this rule](https://complete-ts.github.io/eslint-plugin-complete)
- [Rule source](https://github.com/complete-ts/complete/blob/main/packages/eslint-plugin-complete/src/rules/no-useless-return.ts)
- [Test source](https://github.com/complete-ts/complete/blob/main/packages/eslint-plugin-complete/tests/rules/no-useless-return.test.ts)
