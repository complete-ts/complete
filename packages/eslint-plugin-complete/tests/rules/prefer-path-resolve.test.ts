import { preferPathResolve } from "../../src/rules/prefer-path-resolve.js";
import { ruleTester } from "../utils.js";

ruleTester.run("prefer-path-resolve", preferPathResolve, {
  valid: [
    {
      code: `
path.join("foo", "bar");
      `,
    },
    {
      code: `
path.resolve(projectRoot, "..");
      `,
    },
  ],

  invalid: [
    {
      code: `
path.join("..");
      `,
      output: `
path.resolve("..");
      `,
      errors: [{ messageId: "usePathResolve" }],
    },
    {
      code: `
path.join(projectRoot, "..");
      `,
      output: `
path.resolve(projectRoot, "..");
      `,
      errors: [{ messageId: "usePathResolve" }],
    },
    {
      code: `
path.join(projectRoot, somethingElse, "..");
      `,
      output: `
path.resolve(projectRoot, somethingElse, "..");
      `,
      errors: [{ messageId: "usePathResolve" }],
    },
  ],
});
