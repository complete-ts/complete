import { noVoidReturnType } from "../../src/rules/no-void-return-type.js";
import { ruleTester } from "../utils.js";

ruleTester.run("no-void-return-type", noVoidReturnType, {
  valid: [
    {
      code: `
function foo() {}
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
