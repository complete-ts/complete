import { equal } from "node:assert";
import test, { describe } from "node:test";
import { isMain } from "./utils.js";

describe("isMain", () => {
  test("inside a test script", () => {
    equal(isMain(), true);
  });
});
