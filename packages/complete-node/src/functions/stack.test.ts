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

  test("1 parent function", () => {
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

  test("2 parent functions", () => {
    function foo() {
      bar();
    }

    function bar() {
      baz();
    }

    // eslint-disable-next-line unicorn/consistent-function-scoping
    function baz() {
      const { name, filePath } = getCallingFunction(2);
      equal(name, "foo");
      const fileName = path.basename(filePath);
      equal(fileName, "stack.test.ts");
    }

    foo();
  });
});
