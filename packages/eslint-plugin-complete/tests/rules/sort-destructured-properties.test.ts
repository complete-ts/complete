import { sortDestructuredProperties } from "../../src/rules/sort-destructured-properties.js";
import { ruleTester } from "../utils.js";

ruleTester.run("sort-destructured-properties", sortDestructuredProperties, {
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

declare const foo: Foo;
const { name, description } = foo;
      `,
    },
    {
      code: `
interface Foo {
  name: string;
  description: string;
}

declare const foo: Foo;
const { name: fooName, description: fooDescription } = foo;
      `,
    },
    {
      code: `
interface Foo {
  name: string;
  description: string;
}

function logFoo({ name, description }: Foo) {
  console.log(name, description);
}
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

declare const foo: Foo;
const { nested: { name, description } } = foo;
      `,
    },
    {
      code: `
declare function getFields<T extends string>(
  ...fieldNames: readonly T[]
): Record<T, string>;

const { name, version } = getFields("name", "version");
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

declare const foo: Foo;
const { description, name } = foo;
      `,
      output: `
interface Foo {
  name: string;
  description: string;
}

declare const foo: Foo;
const { name, description } = foo;
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

declare const foo: Foo;
const { description: fooDescription, name: fooName } = foo;
      `,
      output: `
interface Foo {
  name: string;
  description: string;
}

declare const foo: Foo;
const { name: fooName, description: fooDescription } = foo;
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

function logFoo({ description, name }: Foo) {
  console.log(name, description);
}
      `,
      output: `
interface Foo {
  name: string;
  description: string;
}

function logFoo({ name, description }: Foo) {
  console.log(name, description);
}
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

declare const foo: Foo;
const { nested: { description, name } } = foo;
      `,
      output: `
interface Foo {
  nested: {
    name: string;
    description: string;
  };
}

declare const foo: Foo;
const { nested: { name, description } } = foo;
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
