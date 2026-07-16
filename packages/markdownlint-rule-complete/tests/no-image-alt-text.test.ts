import { expect, test } from "bun:test";
import noImageAltText from "../src/rules/no-image-alt-text.js";
import { testMarkdownlintRule } from "./utils.js";

test("removes image alt text", () => {
  const input = "![foo](foo.png)";
  const { errors, fixed } = testMarkdownlintRule(noImageAltText, input);
  expect(errors).toHaveLength(1);
  expect(fixed).toBe("![](foo.png)");
});

test("allows images without alt text", () => {
  const input = "![](foo.png)";
  const { errors } = testMarkdownlintRule(noImageAltText, input);
  expect(errors).toHaveLength(0);
});
