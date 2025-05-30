import { preferReadonlyParameterTypes } from "../../src/rules/prefer-readonly-parameter-types.js";
import { ruleTester } from "../utils.js";

ruleTester.run(
  "prefer-readonly-parameter-types",
  preferReadonlyParameterTypes,
  {
    valid: [
      {
        code: `
function foo(array: readonly string[]) {}
        `,
      },
      {
        code: `
declare interface Foo {
  someProp: string;
}
function foo(array: readonly Foo[]) {}
        `,
      },
      {
        code: `
function foo(map: ReadonlyMap<string, string>) {}
        `,
      },
      {
        code: `
function foo(set: ReadonlySet<string>) {}
        `,
      },
      {
        code: `
function foo(record: Readonly<Record<string, string>>) {}
        `,
      },
      {
        code: `
interface Foo {
  arg1: boolean;
}
function foo(arg: Foo | string[]) {}
        `,
      },
      {
        code: `
[].map((value, index, array) => value);
        `,
      },
    ],

    invalid: [
      {
        code: `
function foo(array: string[]) {}
        `,
        errors: [{ messageId: "shouldBeReadonly" }],
      },
      {
        code: `
declare interface Foo {
  someProp: string;
}
function foo(array: Foo[]) {}
        `,
        errors: [{ messageId: "shouldBeReadonly" }],
      },
      {
        code: `
function foo(map: Map<string, string>) {}
        `,
        errors: [{ messageId: "shouldBeReadonly" }],
      },
      {
        code: `
function foo(map: Set<string>) {}
        `,
        errors: [{ messageId: "shouldBeReadonly" }],
      },
      {
        code: `
function foo(record: Record<string, string>) {}
        `,
        errors: [{ messageId: "shouldBeReadonly" }],
      },
      {
        code: `
function foo(arg1: boolean, array: string[]) {}
        `,
        errors: [{ messageId: "shouldBeReadonly" }],
      },
      {
        code: `
function foo(arg1: boolean, map: Map<string, string>) {}
        `,
        errors: [{ messageId: "shouldBeReadonly" }],
      },
      {
        code: `
function foo(arg1: boolean, map: Set<string>) {}
        `,
        errors: [{ messageId: "shouldBeReadonly" }],
      },
      {
        code: `
function foo(arg1: boolean, record: Record<string, string>) {}
        `,
        errors: [{ messageId: "shouldBeReadonly" }],
      },
    ],
  },
);
