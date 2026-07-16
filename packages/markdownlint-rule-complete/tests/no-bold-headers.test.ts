import { expect, test } from "bun:test";
import noBoldHeaders from "../src/rules/no-bold-headers.js";
import { testMarkdownlintRule } from "./utils.js";

test("no-bold-headers", () => {
  const input = `
# **Bold Title**

## **Bold Title**

### Partially **Bold**
`;
  const output = `
# Bold Title

## Bold Title

### Partially Bold
`;
  const { errors, fixed } = testMarkdownlintRule(noBoldHeaders, input);
  expect(errors).toHaveLength(3);
  expect(fixed).toBe(output);
});
