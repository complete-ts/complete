import { preferIsArray } from "../../src/rules/prefer-is-array.js";
import { ruleTester } from "../utils.js";

ruleTester.run("prefer-is-array", preferIsArray, {
  valid: [{ code: "isArray(foo)" }, { code: "isArray(foo) && isArray(bar)" }],

  invalid: [
    {
      code: "Array.isArray(foo)",
      errors: [{ messageId: "useIsArray" }],
      output: "isArray(foo)",
    },
    {
      code: "if (Array.isArray(bar)) {}",
      errors: [{ messageId: "useIsArray" }],
      output: "if (isArray(bar)) {}",
    },
    {
      code: "const x = Array.isArray;",
      errors: [{ messageId: "useIsArray" }],
      output: "const x = isArray;",
    },
  ],
});
