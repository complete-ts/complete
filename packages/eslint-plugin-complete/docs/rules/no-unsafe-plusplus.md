# `no-unsafe-plusplus`

Disallow unsafe and confusing uses of the `++` and `--` operators.

## Rule Details

This rule heavily restricts the usage of the `++` and `--` operators. Essentially, you are only allowed to use "foo++" in places where swapping it to "++foo" or "foo += 1" would have no functional change in the program.

This rule is meant to be used in conjunction with this [`prefer-plusplus`](prefer-plusplus.md) and [`prefer-postfix-plusplus`](prefer-postfix-plusplus.md) ESLint rules.

```ts
// Bad
(foo++, foo++, foo++);
for (foo++; ; ) {}
for (; foo++; ) {}
foo++ + foo++;
array[foo++];

// Good
foo++;
void foo++;
(foo++, foo++, 0);
for (; ; foo++) {}
```

## Options and Defaults

```json
{
  "rules": {
    "complete/no-unsafe-plusplus": "error"
  }
}
```

This rule is not configurable.

## Credits

This rule was originally created by webstrand in the TypeScript Discord. <!-- cspell:ignore webstrand -->

## Resources

- [How to use this rule](../..)
- [Rule source](https://github.com/complete-ts/complete/blob/main/packages/eslint-plugin-complete/src/rules/no-unsafe-plusplus.ts)
- [Test source](https://github.com/complete-ts/complete/blob/main/packages/eslint-plugin-complete/tests/rules/no-unsafe-plusplus.test.ts)
