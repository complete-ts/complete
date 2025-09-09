import { equal } from "node:assert";
import test, { describe } from "node:test";
import { isMain } from "./utils.js";

describe("isMain", () => {
  test(() => {
    equal(isMain(import.meta.filename), true);
  });
});
