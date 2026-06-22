import { noRedundantJSDocDefault } from "../../src/rules/no-redundant-jsdoc-default.js";
import { ruleTester } from "../utils.js";

ruleTester.run("no-redundant-jsdoc-default", noRedundantJSDocDefault, {
  valid: [
    {
      code: `
interface Options {
  readonly enabled?: boolean;
}

const options: Options = {
  enabled: true,
};
      `,
    },
    {
      code: `
interface Options {
  /** @default true */
  readonly enabled?: boolean;
}

const options: Options = {
  enabled: false,
};
      `,
    },
    {
      code: `
interface Options {
  /** @default [] */
  readonly values?: readonly string[];
}

const options: Options = {
  values: [],
};
      `,
    },
    {
      code: `
interface Options {
  /** @default true */
  readonly enabled?: boolean;
}

const enabled = true;

const options: Options = {
  enabled,
};
      `,
    },
  ],

  invalid: [
    {
      code: `
interface Options {
  /** @default true */
  readonly enabled?: boolean;
}

const options: Options = {
  enabled: true,
};
      `,
      errors: [{ messageId: "redundantDefault" }],
    },
    {
      code: `
interface Options {
  /** @default "main" */
  readonly branch?: string;
}

const options: Options = {
  branch: "main",
};
      `,
      errors: [{ messageId: "redundantDefault" }],
    },
    {
      code: `
interface Options {
  /** @defaultValue 5 */
  readonly retries?: number;
}

const options: Options = {
  retries: 5,
};
      `,
      errors: [{ messageId: "redundantDefault" }],
    },
    {
      code: `
interface Options {
  /** @default null */
  readonly value?: string | null;
}

const options: Options = {
  value: null,
};
      `,
      errors: [{ messageId: "redundantDefault" }],
    },
    {
      code: `
interface Options {
  /** @default -1 */
  readonly retries?: number;
}

const options: Options = {
  retries: -1,
};
      `,
      errors: [{ messageId: "redundantDefault" }],
    },
  ],
});
