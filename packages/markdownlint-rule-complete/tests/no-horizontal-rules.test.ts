import { expect, test } from "bun:test";
import noHorizontalRules from "../src/rules/no-horizontal-rules.js";
import { testMarkdownlintRule } from "./utils.js";

test("no-horizontal-rules", () => {
  const input = `
foo

---

bar

***

baz

___

foo
`; // The extra newlines will be autofixed by MD012.
  const output = `
foo


bar


baz


foo
`;
  const { errors, fixed } = testMarkdownlintRule(noHorizontalRules, input);
  expect(errors).toHaveLength(3);
  expect(fixed).toBe(output);
});
