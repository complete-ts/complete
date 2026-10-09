import { noPrivateIdentifiers } from "../../src/rules/no-private-identifiers.js";
import { ruleTester } from "../utils.js";

ruleTester.run("no-private-identifiers", noPrivateIdentifiers, {
  valid: [
    {
      code: `
class Foo {
  private value = 1;
  private static count = 0;

  private method() {
    return this.value;
  }

  private get current() {
    return this.value;
  }

  private set current(value: number) {
    this.value = value;
  }
}
      `,
    },
    {
      code: `
class Foo {
  public value = 1;
  protected method() {}
}
      `,
    },
    {
      code: `
class Foo {
  constructor(private value: number) {}
}
      `,
    },
    {
      code: `
class Foo {
  "#value" = 1;

  method() {
    return this["#value"];
  }
}
      `,
    },
  ],

  invalid: [
    {
      code: `
class Foo {
  #value = 1;
}
      `,
      languageOptions: {
        parserOptions: {
          projectService: false,
        },
      },
      errors: [
        {
          messageId: "noPrivateIdentifiers",
          line: 3,
          column: 3,
          endLine: 3,
          endColumn: 9,
        },
      ],
    },
    {
      code: `
class Foo {
  static #value = 1;
}
      `,
      errors: [{ messageId: "noPrivateIdentifiers" }],
    },
    {
      code: `
class Foo {
  #method() {}
}
      `,
      errors: [{ messageId: "noPrivateIdentifiers" }],
    },
    {
      code: `
class Foo {
  static #method() {}
}
      `,
      errors: [{ messageId: "noPrivateIdentifiers" }],
    },
    {
      code: `
class Foo {
  get #value() {
    return 1;
  }

  set #value(value: number) {}
}
      `,
      errors: [
        { messageId: "noPrivateIdentifiers" },
        { messageId: "noPrivateIdentifiers" },
      ],
    },
    {
      code: `
class Foo {
  #value = 1;

  method() {
    return this.#value;
  }
}
      `,
      errors: [
        { messageId: "noPrivateIdentifiers" },
        { messageId: "noPrivateIdentifiers" },
      ],
    },
    {
      code: `
class Foo {
  #method() {}

  method() {
    this.#method();
  }
}
      `,
      errors: [
        { messageId: "noPrivateIdentifiers" },
        { messageId: "noPrivateIdentifiers" },
      ],
    },
    {
      code: `
class Foo {
  static #value = 1;

  static method() {
    return Foo.#value;
  }
}
      `,
      errors: [
        { messageId: "noPrivateIdentifiers" },
        { messageId: "noPrivateIdentifiers" },
      ],
    },
    {
      code: `
class Foo {
  #value = 1;

  static hasValue(object: object) {
    return #value in object;
  }
}
      `,
      errors: [
        { messageId: "noPrivateIdentifiers" },
        { messageId: "noPrivateIdentifiers" },
      ],
    },
  ],
});
