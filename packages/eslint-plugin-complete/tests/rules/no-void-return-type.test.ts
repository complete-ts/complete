import { noVoidReturnType } from "../../src/rules/no-void-return-type.js";
import { ruleTester } from "../utils.js";

ruleTester.run("no-void-return-type", noVoidReturnType, {
  valid: [
    {
      code: `
function foo() {}
      `,
    },
    {
      code: `
function foo(): boolean {}
      `,
    },
    {
      code: `
function foo(arg: unknown): asserts arg is boolean {}
      `,
    },
  ],

  invalid: [
    {
      code: `
function foo(): void {}
      `,
      errors: [{ messageId: "voidReturnType" }],
      output: `
function foo() {}
      `,
    },
    {
      code: `
async function foo(): Promise<void> {}
      `,
      errors: [{ messageId: "voidReturnType" }],
      output: `
async function foo() {}
      `,
    },
  ],
});
