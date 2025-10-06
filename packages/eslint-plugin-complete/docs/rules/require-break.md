# require-break

💼 This rule is enabled in the ✅ `recommended` config.

Requires that each non-fallthrough case of a switch statement has a `break` statement.

<!-- end auto-generated rule header -->

## Rule Details

The [`no-fallthrough`](https://eslint.org/docs/latest/rules/no-fallthrough) core ESLint rule helps to ensure that switch statements do not accidentally "fall through", which is a common mistake. It does this by ensuring that you put a break statement (or a `return`/`throw`) in every non-empty switch case.

However, it does not enforce a `break` statement on the final case. This makes sense, because there is nothing that the final case could ever fallthrough to. With that said, it can still be desirable to enforce a `break` statement for the final case. Doing this makes switch arms look more consistent, makes switch arms more resilient to reorganization, and reduces Git noise when a new switch case is added at the bottom. (This is similar to the benefits provided by trailing commas.)

This rule enforces `break` statements on the final case.

Note that this rule will still apply even if the final case is a `default` case, and this is intentional. Assuming that `default` cases are always at the bottom of a switch statement (using the [`default-case-last`](https://eslint.org/docs/latest/rules/default-case-last) rule), `default` cases are distinct from other case statements in that they would not ever need to be reorganized or have something added underneath. So, the reasons for wanting a `break` statement in a `default` case are less intuitive. First, having "empty" `default` cases are sometimes required in order to satisfy the [`@typescript-eslint/switch-exhaustiveness-check`](https://typescript-eslint.io/rules/switch-exhaustiveness-check/) rule (e.g. when you only want to define behavior for 2 out of 10 enum members). In these cases, a `break` statement is useful to order to avoid triggering the [`no-empty`](https://eslint.org/docs/rules/no-empty) rule and to avoid the appearance of the arm being unfinished. Thus, since `break` statements might be desired for otherwise-empty `default` cases, it can make sense to enforce them in every `default` case across a codebase for consistency.

```ts
// Bad
switch (foo) {
  case 1: {
    doSomething1();
    break;
  }

  case 2: {
    doSomething2();
  }
}

// Good
switch (foo) {
  case 1: {
    doSomething1();
    break;
  }

  case 2: {
    doSomething2();
    break;
  }
}
```

## Options

This rule is not configurable.

## Resources

- [How to use this rule](https://complete-ts.github.io/eslint-plugin-complete)
- [Rule source](https://github.com/complete-ts/complete/blob/main/packages/eslint-plugin-complete/src/rules/require-break.ts)
- [Test source](https://github.com/complete-ts/complete/blob/main/packages/eslint-plugin-complete/tests/rules/require-break.test.ts)
