# no-cspell-words

Disallows CSpell `words` directives.

## Rule Details

Project-specific words should be added to the CSpell configuration instead of being scattered across Markdown files. Other CSpell directives remain allowed.

<!-- markdownlint-disable no-cspell-words -->

```md
<!-- Bad -->

<!-- cspell:words foo --> foo

<!-- Good -->

foo
```

## Options

This rule is not configurable.

## Resources

- [How to use this rule](https://complete-ts.github.io/markdownlint-rule-complete)
- [Rule source](https://github.com/complete-ts/complete/blob/main/packages/markdownlint-rule-complete/src/rules/no-cspell-words.ts)
- [Test source](https://github.com/complete-ts/complete/blob/main/packages/markdownlint-rule-complete/tests/no-cspell-words.test.ts)
