import { equal } from "node:assert";
import { describe, test } from "node:test";
import {
  hasDiacritic,
  hasEmoji,
  isKebabCase,
  trimPrefix,
  trimSuffix,
} from "./string.js";

describe("hasEmoji", () => {
  test("should return true for string with normal emoji", () => {
    equal(hasEmoji("Hello 😃 World"), true);
  });

  test("should return true for string with keycap emoji", () => {
    equal(hasEmoji("This is a keycap emoji: #️⃣"), true);
  });

  test("should return false for string without emoji", () => {
    equal(hasEmoji("Hello World"), false);
    equal(
      hasEmoji(`
# Some Markdown Title

This page is for people who like [cake](https://en.wikipedia.org/wiki/Cake).

- Run \`command cake\` to get cake.
- Run \`command pie\` to get pie.
      `),
      false,
    );
  });

  test("should handle empty string", () => {
    equal(hasEmoji(""), false);
  });

  test("should handle strings with only emoji", () => {
    equal(hasEmoji("😊"), true);
    equal(hasEmoji("🚀"), true);
  });
});

describe("hasDiacritic", () => {
  test("should return true for diacritic character", () => {
    equal(hasDiacritic("á"), true);
    equal(hasDiacritic("è"), true);
    equal(hasDiacritic("ô"), true);
  });

  test("should return false for non-diacritic character", () => {
    equal(hasDiacritic("A"), false);
    equal(hasDiacritic("1"), false);
    equal(hasDiacritic("!"), false);
  });

  test("should handle empty string", () => {
    equal(hasDiacritic(""), false);
  });
});

describe("isKebabCase", () => {
  test("should return true for valid kebab-case strings", () => {
    equal(isKebabCase("hello-world"), true);
    equal(isKebabCase("lowercase"), true);
    equal(isKebabCase("item-123-abc"), true);
    equal(isKebabCase("section-1a"), true);
    equal(isKebabCase("segment-1-2-3"), true);
    equal(isKebabCase("1-2-3"), true);
    equal(isKebabCase("12345"), true);
    equal(isKebabCase("fix-k8s"), true);
  });

  test("should return false for strings with uppercase letters", () => {
    equal(isKebabCase("HelloWorld"), false);
    equal(isKebabCase("helloWorld"), false);
    equal(isKebabCase("Hello-World"), false);
    equal(isKebabCase("kebab-Case"), false);
    equal(isKebabCase("HELLO-WORLD"), false);
    equal(isKebabCase("UPPERCASE"), false);
  });

  test("should return false for strings with spaces", () => {
    equal(isKebabCase("hello world"), false);
    equal(isKebabCase(" hello-world"), false);
    equal(isKebabCase("hello-world "), false);
    equal(isKebabCase("hello - world"), false);
  });

  test("should return false for strings with underscores", () => {
    equal(isKebabCase("hello_world"), false);
    equal(isKebabCase("snake_case_example"), false);
  });

  test("should return false for strings with consecutive hyphens", () => {
    equal(isKebabCase("hello--world"), false);
    equal(isKebabCase("a--b--c"), false);
  });

  test("should return false for strings starting or ending with a hyphen", () => {
    equal(isKebabCase("-hello-world"), false);
    equal(isKebabCase("hello-world-"), false);
    equal(isKebabCase("-start"), false);
    equal(isKebabCase("end-"), false);
    equal(isKebabCase("-"), false);
  });

  test("should return false for strings with special characters other than hyphens", () => {
    equal(isKebabCase("hello-world!"), false);
    equal(isKebabCase("test@example"), false);
    equal(isKebabCase("kebab$case"), false);
    equal(isKebabCase("has-#-symbol"), false);
    equal(isKebabCase("dot.case"), false);
    equal(isKebabCase("slash/case"), false);
  });

  test("should return false for mixed separators", () => {
    equal(isKebabCase("hello_world-foo"), false);
    equal(isKebabCase("hello-world_bar"), false);
  });

  test("should return false for an empty string", () => {
    equal(isKebabCase(""), false);
  });
});

describe("trimPrefix", () => {
  test(() => {
    equal(trimPrefix("foo", ""), "foo");
    equal(trimPrefix("foo", "f"), "oo");
    equal(trimPrefix("foo", "fo"), "o");
    equal(trimPrefix("foo", "foo"), "");
    equal(trimPrefix("foo", "foo1"), "foo");
  });
});

describe("trimSuffix", () => {
  test(() => {
    equal(trimSuffix("foo", ""), "foo");
    equal(trimSuffix("foo", "o"), "fo");
    equal(trimSuffix("foo", "oo"), "f");
    equal(trimSuffix("foo", "foo"), "");
    equal(trimSuffix("foo", "1foo"), "foo");
  });
});
