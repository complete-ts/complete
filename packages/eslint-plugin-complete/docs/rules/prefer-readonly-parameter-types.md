# prefer-readonly-parameter-types

💼 This rule is enabled in the ✅ `recommended` config.

Require function parameters to be typed as `readonly` to prevent accidental mutation of inputs.

⚙️ This rule is configurable.

💭 This rule requires [type information](https://typescript-eslint.io/linting/typed-linting).

<!-- end auto-generated rule header -->

This is the same thing as the [`@typescript-eslint/prefer-readonly-parameter-types`](https://typescript-eslint.io/rules/prefer-readonly-parameter-types/) rule, with the follow changes:

- The `allow` array is hard-coded to always contain `ReadonlyMap` and `ReadonlySet`.
- An additional option of "onlyRecordsArraysMapsSet" is added. This option will make the rule only examine a function parameter if it is a record, an array, a tuple, a map, or a set. (In other words, only "simple" types.) The option defaults to true. The motivation behind this option is that it reduces a ton of false positives, which still retaining the core value of the rule.

## Resources

- [How to use this rule](https://complete-ts.github.io/eslint-plugin-complete)
- [Rule source](https://github.com/complete-ts/complete/blob/main/packages/eslint-plugin-complete/src/rules/prefer-readonly-parameter-types.ts)
- [Test source](https://github.com/complete-ts/complete/blob/main/packages/eslint-plugin-complete/tests/rules/prefer-readonly-parameter-types.test.ts)
