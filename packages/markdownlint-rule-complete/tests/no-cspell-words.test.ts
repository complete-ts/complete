import { expect, test } from "bun:test";
import noCspellWords from "../src/rules/no-cspell-words.js";
import { testMarkdownlintRule } from "./utils.js";

test("allows other cspell directives", () => {
  const input = "<!-- cspell:disable-next-line -->";
  const { errors } = testMarkdownlintRule(noCspellWords, input);
  expect(errors).toHaveLength(0);
});

test("disallows cspell words directives", () => {
  const input = "<!-- cspell:words example -->";
  const { errors } = testMarkdownlintRule(noCspellWords, input);
  expect(errors).toHaveLength(1);
});

test("disallows cspell words directives with whitespace", () => {
  const input = "<!-- cspell: words example -->";
  const { errors } = testMarkdownlintRule(noCspellWords, input);
  expect(errors).toHaveLength(1);
});

test("disallows cspell words directives outside of a comment", () => {
  const input = "cspell:words example";
  const { errors } = testMarkdownlintRule(noCspellWords, input);
  expect(errors).toHaveLength(1);
});
