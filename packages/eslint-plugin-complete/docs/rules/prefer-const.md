# `prefer-const`

Requires `const` declarations for variables that are never reassigned after declared.

This is the exact same thing as the ESLint [`prefer-const`](https://eslint.org/docs/latest/rules/prefer-const) rule, except the auto-fixer is disabled.

## Rule Details

This version of the rule without an auto-fixer is useful because it is common during development to comment out code that modifies a `let` variable. In these cases, the auto-fixer is harmful, since it would require us to manually go change the `const` back to a `let` after uncommenting the code to put it back the way it way.

## Gotchas

If you use this rule, make sure to turn off the vanilla ESLint rule, like this:

```json
{
  "rules": {
    "prefer-const": "off"
  }
}
```

Otherwise, the two rules will conflict with each other.

Note that if you use the `recommended` config that comes with this plugin, then the vanilla ESLint rule will be turned off automatically.

## Options

```json
{
  "rules": {
    "complete/prefer-const": "error"
  }
}
```

This rule is not configurable. (All of the unsafe options from the original have been removed.)

## Resources

- [How to use this rule](https://complete-ts.github.io/eslint-plugin-complete)
- [Rule source](https://github.com/complete-ts/complete/blob/main/packages/eslint-plugin-complete/src/rules/prefer-const.ts)
- [Test source](https://github.com/complete-ts/complete/blob/main/packages/eslint-plugin-complete/tests/rules/prefer-const.test.ts)
