import { equal } from "node:assert";
import path from "node:path";
import test, { describe } from "node:test";
import { getCallingFunction } from "./stack.js";

describe("getCallingFunction", () => {
  test("default", () => {
    const { name, filePath } = getCallingFunction();
    equal(name, "runInAsyncScope");
    equal(filePath, "node:async_hooks");
  });

  test("parent function", () => {
    function foo() {
      bar();
    }

    // eslint-disable-next-line unicorn/consistent-function-scoping
    function bar() {
      const { name, filePath } = getCallingFunction();
      equal(name, "foo");
      const fileName = path.basename(filePath);
      equal(fileName, "stack.test.ts");
    }

    foo();
  });
});
