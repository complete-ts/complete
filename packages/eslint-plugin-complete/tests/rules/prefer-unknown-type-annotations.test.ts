import { preferUnknownTypeAnnotations } from "../../src/rules/prefer-unknown-type-annotations.js";
import { ruleTester } from "../utils.js";

ruleTester.run(
  "prefer-unknown-type-annotations",
  preferUnknownTypeAnnotations,
  {
    valid: [
      {
        code: `
const foo: unknown = JSON.parse(fooContents);
      `,
      },
      {
        code: `
const foo = JSON.parse(fooContents) as string[];
      `,
      },
      {
        code: `
const foo: string[] = JSON.parse(fooContents);
      `,
      },
    ],

    invalid: [
      {
        code: `
const foo = JSON.parse(fooContents) as unknown;
      `,
        errors: [{ messageId: "preferTypeAnnotation" }],
        output: `
const foo: unknown = JSON.parse(fooContents);
      `,
      },
      {
        code: `
let value = getValue() as unknown;
      `,
        errors: [{ messageId: "preferTypeAnnotation" }],
        output: `
let value: unknown = getValue();
      `,
      },
    ],
  },
);
