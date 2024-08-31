import { equal } from "node:assert";
import test, { describe } from "node:test";
import { hasDiacritic, hasEmoji } from "./string.js";

describe("hasEmoji", () => {
  test("should return true for string with emoji", () => {
    equal(hasEmoji("Hello 😃 World"), true);
    equal(hasEmoji("This is a 🌟 test"), true);
  });

  test("should return false for string without emoji", () => {
    equal(hasEmoji("Hello World"), false);
    equal(hasEmoji("No emoji here!"), false);
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
