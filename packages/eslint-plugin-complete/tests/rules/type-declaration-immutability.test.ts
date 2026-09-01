import { typeDeclarationImmutability } from "../../src/rules/type-declaration-immutability.js";
import { ruleTester } from "../utils.js";

ruleTester.run("type-declaration-immutability", typeDeclarationImmutability, {
  valid: [
    {
      code: `
type Primitive = string;
type PrimitiveUnion = string | number | undefined;
type MutableElement = {
  value: string;
};
export type Options = [
  {
    readonly maxLength: number;
  },
];

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
