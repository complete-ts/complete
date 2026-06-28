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
const foo = {
  description: "A foo.",
  name: "foo",
};
      `,
    },
    {
      code: `
const foo: Record<string, unknown> = {
  description: "A foo.",
  name: "foo",
};
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
    {
      code: `
interface List {
  kind: string;
  numLeadingSpaces: number;
  markerSize: number;
}

function getList(): List | undefined {
  return {
    kind: "Hyphen",
    numLeadingSpaces: 0,
    markerSize: 2,
  };
}
      `,
    },
    {
      code: `
type ReaddirOptions = {
  encoding?: string;
} & {
  withFileTypes: true;
  recursive?: boolean;
};

declare function readdir(options: ReaddirOptions): void;

readdir({
  withFileTypes: true,
  recursive: true,
});
      `,
    },
  ],

  invalid: [
    {
      code: `
const foo = {
  name: "foo",
  description: "A foo.",
};
      `,
      output: `
const foo = {
  description: "A foo.",
  name: "foo",
};
      `,
      errors: [
        {
          messageId: "incorrectOrder",
          data: {
            earlierName: "description",
            laterName: "name",
          },
        },
      ],
    },
    {
      code: `
const foo: Record<string, unknown> = {
  name: "foo",
  description: "A foo.",
};
      `,
      output: `
const foo: Record<string, unknown> = {
  description: "A foo.",
  name: "foo",
};
      `,
      errors: [
        {
          messageId: "incorrectOrder",
          data: {
            earlierName: "description",
            laterName: "name",
          },
        },
      ],
    },
    {
      code: `
interface List {
  kind: string;
  numLeadingSpaces: number;
  markerSize: number;
}

function getList(): List | undefined {
  return {
    kind: "Hyphen",
    markerSize: 2,
    numLeadingSpaces: 0,
  };
}
      `,
      output: `
interface List {
  kind: string;
  numLeadingSpaces: number;
  markerSize: number;
}

function getList(): List | undefined {
  return {
    kind: "Hyphen",
    numLeadingSpaces: 0,
    markerSize: 2,
  };
}
      `,
      errors: [
        {
          messageId: "incorrectOrder",
          data: {
            earlierName: "numLeadingSpaces",
            laterName: "markerSize",
          },
        },
      ],
    },
    {
      code: `
type ReaddirOptions = {
  encoding?: string;
} & {
  withFileTypes: true;
  recursive?: boolean;
};

declare function readdir(options: ReaddirOptions): void;

readdir({
  recursive: true,
  withFileTypes: true,
});
      `,
      output: `
type ReaddirOptions = {
  encoding?: string;
} & {
  withFileTypes: true;
  recursive?: boolean;
};

declare function readdir(options: ReaddirOptions): void;

readdir({
  withFileTypes: true,
  recursive: true,
});
      `,
      errors: [
        {
          messageId: "incorrectOrder",
          data: {
            earlierName: "withFileTypes",
            laterName: "recursive",
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
