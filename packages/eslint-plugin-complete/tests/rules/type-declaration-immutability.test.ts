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
    {
      code: `
interface ImmutableCollections {
  readonly array: readonly unknown[];
  readonly map: ReadonlyMap<unknown, unknown>;
  readonly set: ReadonlySet<unknown>;
}
      `,
    },
    {
      code: `
type int = number & {};
declare const brand: unique symbol;
type BrandedInt = number & {
  readonly [brand]: "BrandedInt";
};

interface ImmutablePrimitiveIntersections {
  readonly int: int;
  readonly brandedInt: BrandedInt;
}
      `,
    },
    {
      code: `
interface ImmutableTuples {
  readonly tuple: readonly [string, number];
  readonly tupleUnion:
    | readonly [string]
    | readonly [number, boolean];
  readonly nestedTuple: readonly [readonly [string]];
  readonly optionalTuple: readonly [value?: string];
}
      `,
    },
    {
      code: `
type ImmutableTuple = readonly [string, number];

interface ImmutableTupleAlias {
  readonly tuple: ImmutableTuple;
}
      `,
    },
    {
      code: `
type int = number & {};

interface ImmutableCallbackTuple {
  readonly callbackTuple: readonly [
    callback: (value: int) => void,
    filter?: int,
  ];
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
    {
      code: `
interface MutableCollectionValues {
  readonly array: readonly { value: string }[];
  readonly map: ReadonlyMap<string, { value: string }>;
  readonly set: ReadonlySet<{ value: string }>;
}
      `,
      errors: [{ messageId: "mustBeImmutable" }],
    },
    {
      code: `
type MutableInt = number & {
  value: string;
};

interface MutablePrimitiveIntersection {
  readonly int: MutableInt;
}
      `,
      errors: [{ messageId: "mustBeImmutable" }],
    },
    {
      code: `
type PrimitiveIntersectionWithMethod = number & {
  mutate(): void;
};

interface PrimitiveIntersectionWithMethodProperty {
  readonly int: PrimitiveIntersectionWithMethod;
}
      `,
      errors: [{ messageId: "mustBeImmutable" }],
    },
    {
      code: `
interface MutableTuple {
  readonly tuple: [string, number];
}
      `,
      errors: [{ messageId: "mustBeImmutable" }],
    },
    {
      code: `
interface ReadonlyTupleWithMutableValue {
  readonly tuple: readonly [{ value: string }];
}
      `,
      errors: [{ messageId: "mustBeImmutable" }],
    },
    {
      code: `
type GenericTuple<T> = readonly [T];

interface ImmutableGenericTuple {
  readonly tuple: GenericTuple<string>;
}

interface MutableGenericTuple {
  readonly tuple: GenericTuple<{ value: string }>;
}
      `,
      errors: [{ messageId: "mustBeImmutable" }],
    },
  ],
});
