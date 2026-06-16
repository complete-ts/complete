import { sortObjects } from "../../src/rules/sort-objects.js";
import { ruleTester } from "../utils.js";

ruleTester.run("sort-objects", sortObjects, {
  valid: [
    {
      code: `
const a = 1;
      `,
    },
    {
      code: `
interface Foo {
  name: string;
  description: string;
}

const foo: Foo = {
  name: "foo",
  description: "A foo.",
};
      `,
    },
    {
      code: `
interface Foo {
  name: string;
  description: string;
}

logFoo({
  name: "foo",
  description: "A foo.",
});

declare function logFoo(foo: Foo): void;
      `,
    },
    {
      code: `
interface Foo {
  nested: {
    name: string;
    description: string;
  };
}

const foo: Foo = {
  nested: {
    name: "foo",
    description: "A foo.",
  },
};
      `,
    },
  ],

  invalid: [
    {
      code: `
interface Foo {
  name: string;
  description: string;
}

const foo: Foo = { description: "A foo.", name: "foo" };
      `,
      output: `
interface Foo {
  name: string;
  description: string;
}

const foo: Foo = { name: "foo", description: "A foo." };
      `,
      errors: [
        {
          messageId: "incorrectOrder",
          data: {
            earlierName: "name",
            laterName: "description",
          },
        },
      ],
    },
    {
      code: `
interface Foo {
  name: string;
  description: string;
}

const foo: Foo = {
  description: "A foo.",
  name: "foo",
};
      `,
      output: `
interface Foo {
  name: string;
  description: string;
}

const foo: Foo = {
  name: "foo",
  description: "A foo.",
};
      `,
      errors: [
        {
          messageId: "incorrectOrder",
          data: {
            earlierName: "name",
            laterName: "description",
          },
        },
      ],
    },
    {
      code: `
interface Foo {
  name: string;
  description: string;
}

logFoo({
  description: "A foo.",
  name: "foo",
});

declare function logFoo(foo: Foo): void;
      `,
      output: `
interface Foo {
  name: string;
  description: string;
}

logFoo({
  name: "foo",
  description: "A foo.",
});

declare function logFoo(foo: Foo): void;
      `,
      errors: [
        {
          messageId: "incorrectOrder",
          data: {
            earlierName: "name",
            laterName: "description",
          },
        },
      ],
    },
    {
      code: `
interface Foo {
  nested: {
    name: string;
    description: string;
  };
}

const foo: Foo = {
  nested: {
    description: "A foo.",
    name: "foo",
  },
};
      `,
      output: `
interface Foo {
  nested: {
    name: string;
    description: string;
  };
}

const foo: Foo = {
  nested: {
    name: "foo",
    description: "A foo.",
  },
};
      `,
      errors: [
        {
          messageId: "incorrectOrder",
          data: {
            earlierName: "name",
            laterName: "description",
          },
        },
      ],
    },
  ],
});
