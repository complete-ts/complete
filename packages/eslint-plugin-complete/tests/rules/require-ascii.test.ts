/* eslint-disable complete/require-ascii */
/* cspell:words Αlice */

import { requireAscii } from "../../src/rules/require-ascii.js";
import { ruleTester } from "../utils.js";

ruleTester.run("require-ascii", requireAscii, {
  valid: [
    {
      code: `
const name = "Alice"; // Normal A
      `,
    },
    {
      code: `
const name = "Αlice"; // Alice with a Greek letter A (0x391)
      `,
      options: [{ whitelist: ["Α"] }],
    },
  ],

  invalid: [
    {
      code: `
// cspell:disable-next-line
const name = "Αlice"; // Alice with a Greek letter A (0x391)
      `,
      errors: [{ messageId: "onlyASCII", data: { character: "Α" } }],
    },
    {
      code: `
const emoji = "😀";
      `,
      errors: [{ messageId: "onlyASCII", data: { character: "😀" } }],
    },
  ],
});
