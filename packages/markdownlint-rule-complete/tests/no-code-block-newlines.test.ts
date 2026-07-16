import { expect, test } from "bun:test";
import noCodeBlockNewlines from "../src/rules/no-code-block-newlines.js";
import { testMarkdownlintRule } from "./utils.js";

test("normal code block", () => {
  const input = `
\`\`\`txt
hello world
\`\`\``;
  const { errors } = testMarkdownlintRule(noCodeBlockNewlines, input);
  expect(errors).toHaveLength(0);
});

test("blank line on top", () => {
  const input = `
\`\`\`txt

hello world
\`\`\`
`;
  const output = `
\`\`\`txt
hello world
\`\`\`
`;
  const { errors, fixed } = testMarkdownlintRule(noCodeBlockNewlines, input);
  expect(errors).toHaveLength(1);
  expect(fixed).toBe(output);
});

test("blank line on bottom", () => {
  const input = `
\`\`\`txt
hello world

\`\`\`
`;
  const output = `
\`\`\`txt
hello world
\`\`\`
`;
  const { errors, fixed } = testMarkdownlintRule(noCodeBlockNewlines, input);
  expect(errors).toHaveLength(1);
  expect(fixed).toBe(output);
});
