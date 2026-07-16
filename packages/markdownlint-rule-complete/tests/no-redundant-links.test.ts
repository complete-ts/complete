import { expect, test } from "bun:test";
import { noRedundantLinks } from "../src/rules/no-redundant-links.js";
import { testMarkdownlintRule } from "./utils.js";

test("normal link", () => {
  const input =
    "[Microsoft Teams Admin Center](https://admin.teams.microsoft.com)";
  const { errors } = testMarkdownlintRule(noRedundantLinks, input);
  expect(errors).toHaveLength(0);
});

test("redundant link", () => {
  const input =
    "[https://admin.teams.microsoft.com](https://admin.teams.microsoft.com)";
  const { errors } = testMarkdownlintRule(noRedundantLinks, input);
  expect(errors).toHaveLength(1);
});

test("link with different URL", () => {
  const input =
    "[https://admin.teams.microsoft.com](https://teams.microsoft.com)";
  const { errors } = testMarkdownlintRule(noRedundantLinks, input);
  expect(errors).toHaveLength(0);
});

test("bare URL", () => {
  const input = "https://admin.teams.microsoft.com";
  const { errors } = testMarkdownlintRule(noRedundantLinks, input);
  expect(errors).toHaveLength(0);
});
