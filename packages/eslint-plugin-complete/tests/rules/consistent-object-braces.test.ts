import { consistentObjectBraces } from "../../src/rules/consistent-object-braces.js";
import { ruleTester } from "../utils.js";

ruleTester.run("consistent-object-braces", consistentObjectBraces, {
  valid: [
    {
      code: `
const foo = { bar };
      `,
    },
    {
      code: `
const { foo } = bar;
      `,
    },
    {
      code: `
const {
  bar,
} = foo;
      `,
    },
    {
      code: `
const {} = foo;
      `,
    },
    {
      code: `
const foo = {
  bar,
  baz,
};
      `,
    },
    {
      code: `
const foo = {
  nested: {
    bar,
    baz
  },
};
      `,
    },
  ],

  invalid: [
    {
      code: `
const foo = {
  bar
};
      `,
      output: `
const foo = { bar };
      `,
      errors: [
        { messageId: "consistentObjectBraces" },
      ],
    },
    {
      code: `
const foo = { bar, baz };
      `,
      output: `
const foo = {
  bar,
  baz
};
      `,
      errors: [
        { messageId: "consistentObjectBraces" },
      ],
    },
    {
      code: `
const foo = { bar, baz, };
      `,
      output: `
const foo = {
  bar,
  baz,
};
      `,
      errors: [
        { messageId: "consistentObjectBraces" },
      ],
    },
    {
      code: `
const foo = {
  bar,
  baz };
      `,
      output: `
const foo = {
  bar,
  baz
};
      `,
      errors: [
        { messageId: "consistentObjectBraces" },
      ],
    },
    {
      code: `
const foo = { bar,
  baz
};
      `,
      output: `
const foo = {
  bar,
  baz
};
      `,
      errors: [
        { messageId: "consistentObjectBraces" },
      ],
    },
  ],
});
