import { deepStrictEqual } from "node:assert";
import { describe, test } from "node:test";
import { unique } from "../../src/functions/array.js";

describe("unique", () => {
  test("should sort unique strings", () => {
    const result = unique(["b", "a", "b", "c", "a"]);
    deepStrictEqual(result, ["a", "b", "c"]);
  });

  test("should sort unique numbers", () => {
    const result = unique([10, 2, 1, 10, 2]);
    deepStrictEqual(result, [1, 2, 10]);
  });
});
