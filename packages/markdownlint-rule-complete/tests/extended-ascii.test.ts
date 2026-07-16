import { expect, test } from "bun:test";
import extendedAscii from "../src/rules/extended-ascii.js";
import { testMarkdownlintRule } from "./utils.js";

test("plain text", () => {
  const { errors } = testMarkdownlintRule(extendedAscii, "Plain text");
  expect(errors).toHaveLength(0);
});

test("non-ASCII characters", () => {
  const input =
    // cspell:disable-next-line
    "\u{C4}ccented \u{E7}haracters \u{1F600} \u{201C}smart\u{201D} \u{2014}";
  const { errors } = testMarkdownlintRule(extendedAscii, input);
  expect(errors).toHaveLength(6);
});

test("whitelisted emoji", () => {
  const input = "Some \u{2705} emoji";
  const { errors } = testMarkdownlintRule(extendedAscii, input);
  expect(errors).toHaveLength(0);
});

test("allows specific characters in code blocks", () => {
  const input = `
\`\`\`
foo/
\u{2514}\u{2500}\u{2500} bar/
    \u{251C}\u{2500}\u{2500} baz1
    \u{2514}\u{2500}\u{2500} baz2
\`\`\`
`;
  const { errors } = testMarkdownlintRule(extendedAscii, input);
  expect(errors).toHaveLength(0);
});
