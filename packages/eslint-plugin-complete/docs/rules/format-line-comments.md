# `format-line-comments`

Disallows `//` comments longer than N characters and multi-line comments that can be merged together.

Like [Prettier](https://prettier.io/), this rule is designed to auto-format your comments so that you don't have to think about it. Try [configuring your IDE](/eslint-plugin-complete#automatic-fixing) to run `eslint --fix` on save.

Also see the [`format-jsdoc-comments`](format-jsdoc-comments.md) rule.

For more information on why you should use this rule, see the [comment formatting discussion](../comments.md).

## Rule Details

<!-- cspell:ignore amet consectetur adipiscing elit eiusmod tempor incididunt labore dolore aliqua -->

Lines that are too long will be split to the next line:

```ts
// Bad
// Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.

// Good
// Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut
// labore et dolore magna aliqua.
```

Lines that are too short will be merged together:

```ts
// Bad
// Lorem ipsum dolor sit amet,
// consectetur adipiscing elit

// Good
// Lorem ipsum dolor sit amet, consectetur adipiscing elit
```

The rule tries to be as smart as possible. For example, it won't complain about TypeScript [triple slash directives](https://www.typescriptlang.org/docs/handbook/triple-slash-directives.html):

```ts
/// <reference path="foo1.d.ts" />
```

You can open a GitHub issue if you find a situation where this rule should be smarter.

## Options and Defaults

```json
{
  "rules": {
    "complete/format-line-comments": [
      "error",
      {
        "maxLength": 100
      }
    ]
  }
}
```

## Resources

- [How to use this rule](../..)
- [Rule source](https://github.com/complete-ts/complete/blob/main/packages/eslint-plugin-complete/src/rules/format-line-comments.ts)
- [Test source](https://github.com/complete-ts/complete/blob/main/packages/eslint-plugin-complete/tests/rules/format-line-comments.test.ts)
