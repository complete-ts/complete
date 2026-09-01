import { typeDeclarationImmutability } from "../../src/rules/type-declaration-immutability.js";
import { ruleTester } from "../utils.js";

ruleTester.run("type-declaration-immutability", typeDeclarationImmutability, {
  valid: [
    {
      code: `
type Primitive = string;
type PrimitiveUnion = string | number | undefined;
type MutableElement = {
  readonly value: string;
};
type ImmutableObject = {
  readonly id: number;
  readonly nested: {
    readonly value: string;
  };
};

interface ImmutableInterface {
  readonly id: number;
  readonly nested: {
    readonly value: string;
  };
}
      `,
    },
    {
      code: `
interface LinkedNode {
  readonly next: LinkedNode | undefined;
  readonly value: string;
}
      `,
    },
  ],

  invalid: [
    {
      code: `
type MutableProperty = {
  id: number;
};
      `,
      errors: [{ messageId: "mustBeImmutable" }],
    },
    {
      code: `
type MutableElement = {
  value: string;
};
      `,
      errors: [{ messageId: "mustBeImmutable" }],
    },
    {
      code: `
type MutableNestedProperty = {
  readonly nested: {
    value: string;
  };
};
      `,
      errors: [{ messageId: "mustBeImmutable" }],
    },
    {
      code: `
type MutableArray = {
  readonly values: string[];
};
      `,
      errors: [{ messageId: "mustBeImmutable" }],
    },
    {
      code: `
type ReadonlyDeepArray = readonly string[];
      `,
      errors: [{ messageId: "mustBeImmutable" }],
    },
    {
      code: `
interface MutableInterface {
  id: number;
}
      `,
      errors: [{ messageId: "mustBeImmutable" }],
    },
    {
      code: `
interface MutableNestedInterface {
  readonly nested: {
    value: string;
  };
}
      `,
      errors: [{ messageId: "mustBeImmutable" }],
    },
    {
      code: `
interface InterfaceWithMethod {
  readonly id: number;
  getValue(): number;
}
      `,
      errors: [{ messageId: "mustBeImmutable" }],
    },
  ],
});
