import { expect, test } from "bun:test";
import noSpaceBeforePunctuation from "../src/rules/no-space-before-punctuation.js";
import { testMarkdownlintRule } from "./utils.js";

test("no-space-before-punctuation", () => {
  const input = "Hello . World , and more . Multiple . Spaces , Here .";
  const { errors, fixed } = testMarkdownlintRule(
    noSpaceBeforePunctuation,
    input,
  );
  expect(errors).toHaveLength(6);
  expect(fixed).toBe("Hello. World, and more. Multiple. Spaces, Here.");
});

test("code blocks", () => {
  const input = `
Run the following commands:

\`\`\`sh
black . --check
\`\`\`
`;
  const { errors } = testMarkdownlintRule(noSpaceBeforePunctuation, input);
  expect(errors).toHaveLength(0);
});

test("allows specific phrases", () => {
  const input =
    "Access to .NET types, COM objects, and custom functions is restricted.";
  const { errors } = testMarkdownlintRule(noSpaceBeforePunctuation, input);
  expect(errors).toHaveLength(0);
});

test("multiple spaces", () => {
  const input = "Hello  . World";
  const { fixed } = testMarkdownlintRule(noSpaceBeforePunctuation, input);
  expect(fixed).toBe("Hello. World");
});
