# strict-array-methods

💼 This rule is enabled in the ✅ `recommended` config.

Requires boolean return types on some specific array methods.

<!-- end auto-generated rule header -->

## Rule Details

This rule targets the following Array methods:

- [`Array.prototype.every`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/every)
- [`Array.prototype.filter`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/filter)
- [`Array.prototype.find`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/find)
- [`Array.prototype.findIndex`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/findIndex)
- [`Array.prototype.findLast`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/findLast)
- [`Array.prototype.findLastIndex`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/findLastIndex)
- [`Array.prototype.some`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/some)

Normally, the [`@typescript-eslint/strict-boolean-expressions`](https://typescript-eslint.io/rules/strict-boolean-expressions/) ESLint rule catches bugs where you are supposed to put a boolean value but accidentally put something else. Unfortunately, [that rule does not catch this mistake when using array methods](https://github.com/typescript-eslint/typescript-eslint/issues/8016).

Thus, an additional ESLint rule is necessary to handle this.

```ts
// Bad
const numbers: number[] = [];
const filteredNumbers = numbers.filter((element) => {
  return element;
});

// Good
const numbers: number[] = [];
const filteredNumbers = numbers.filter((element) => {
  return element !== 0;
});
```

## Options

This rule is not configurable.

## Resources

- [How to use this rule](https://complete-ts.github.io/eslint-plugin-complete)
- [Rule source](https://github.com/complete-ts/complete/blob/main/packages/eslint-plugin-complete/src/rules/strict-array-methods.ts)
- [Test source](https://github.com/complete-ts/complete/blob/main/packages/eslint-plugin-complete/tests/rules/strict-array-methods.test.ts)
