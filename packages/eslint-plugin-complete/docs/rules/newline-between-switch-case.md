# `newline-between-switch-case`

Requires newlines between switch cases. Having newlines between each case can make code easier to read, as it better delineates each block.

Based on [this rule](https://github.com/lukeapage/eslint-plugin-switch-case/blob/master/docs/rules/newline-between-switch-case.md).

## Rule Details

This rule does not apply to "fall through" switch cases; those should be squished together with the other cases. See below for an example.

```ts
// Bad
switch (foo) {
  case 1:
  case 2:
  case 3: {
    doSomething();
    break;
  }
  case 4: {
    doSomething();
    break;
  }
}

// Good
switch (foo) {
  case 1:
  case 2:
  case 3: {
    doSomething();
    break;
  }

  case 4: {
    doSomething();
    break;
  }
}
```

## Options and Defaults

```json
{
  "rules": {
    "complete/newline-between-switch-case": "error"
  }
}
```

This rule is not configurable.

## Resources

- [How to use this rule](https://complete-ts.github.io/eslint-plugin-complete)
- [Rule source](https://github.com/complete-ts/complete/blob/main/packages/eslint-plugin-complete/src/rules/newline-between-switch-case.ts)
- [Test source](https://github.com/complete-ts/complete/blob/main/packages/eslint-plugin-complete/tests/rules/newline-between-switch-case.test.ts)
