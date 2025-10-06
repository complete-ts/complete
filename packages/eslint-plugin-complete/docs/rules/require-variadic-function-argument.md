# require-variadic-function-argument

💼 This rule is enabled in the ✅ `recommended` config.

Requires that variadic functions must be supplied with at least one argument.

<!-- end auto-generated rule header -->

## Rule Details

[Variadic functions](https://en.wikipedia.org/wiki/Variadic_function) are functions that take a variable amount of arguments. However, as far as the TypeScript compiler is concerned, passing no arguments at all to a variadic function is legal. But doing this is usually a bug. For example:

```ts
const myArray = [1, 2, 3];
myArray.push(); // Oops!
```

Here, the author of the code made a typo and forgot to supply the thing to be inserted into the array. Thus, the `myArray.push` line is a no-op.

To protect against these kinds of errors, this rule requires that you always pass at least one argument to a variadic function.

## Hard-Coded Exceptions

This rule is hard-coded to not throw an error with `console` methods (such as `console.log` or `console.error`), since:

1. It is relatively common to use these functions with no arguments in order to print a newline.
2. The TypeScript signatures for those functions are weird in that they have a rest parameter as the second parameter instead of the first one.

Additionally, this rule will not be flagged for `setTimeout` or `setInterval`, since those rest parameters are optional.

## JSDoc Exceptions

Sometimes, a variadic function can be written to intentionally allow for zero arguments. If this is the case, you can use a `@allowEmptyVariadic` JSDoc tag inside of the JSDoc comment for the function. Then, this rule will ignore any calls of that function.

For example, something like the following:

```ts
/**
 * Helper function to get all of the cars in the database. By default, it will return every car.
 *
 * You can optionally specify one or more car types to return only the cars that match the specified
 * car types.
 *
 * @allowEmptyVariadic
 */
function getCars(...carTypes: CarType[]) {}
```

## Options

This rule is not configurable.

## Resources

- [How to use this rule](https://complete-ts.github.io/eslint-plugin-complete)
- [Rule source](https://github.com/complete-ts/complete/blob/main/packages/eslint-plugin-complete/src/rules/require-variadic-function-argument.ts)
- [Test source](https://github.com/complete-ts/complete/blob/main/packages/eslint-plugin-complete/tests/rules/require-variadic-function-argument.test.ts)
