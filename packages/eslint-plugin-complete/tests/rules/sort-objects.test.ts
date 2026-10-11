import path from "node:path";
import ts from "typescript";
import { sortObjects } from "../../src/rules/sort-objects.js";
import { ruleTester } from "../utils.js";

const INHERITANCE_FILE_PATH = path.join(__dirname, "../fixtures/file.ts");
const INHERITANCE_CODE = `
import type { Config } from "./sort-objects-derived";

const config: Config = {
  overrides: [],
  plugins: [],
  experimentalOperatorPosition: "start",
};
`;

ruleTester.run("sort-objects", sortObjects, {
  valid: [
    ...[false, true].flatMap((reverseFiles) =>
      [false, true].map((reverseTypes) => ({
        code: INHERITANCE_CODE,
        filename: INHERITANCE_FILE_PATH,
        languageOptions: {
          parserOptions: {
            programs: [createInheritanceProgram(reverseFiles, reverseTypes)],
            projectService: false,
          },
        },
      })),
    ),
    {
      code: `
const a = 1;
      `,
    },
    {
      code: `
const foo = {
  description: "A foo.",
  name: "foo",
};
      `,
    },
    {
      code: `
const foo: Record<string, unknown> = {
  description: "A foo.",
  name: "foo",
};
      `,
    },
    {
      code: `
type ParentConfig = "eslint/recommended" | "@typescript-eslint/recommended";

const links = {
  "eslint/recommended": "eslint",
  "@typescript-eslint/recommended": "typescript-eslint",
} as const satisfies Record<ParentConfig, string>;
      `,
    },
    {
      code: `
type Keys = "name" | "description";
type Values = Record<Keys, string>;

const values: Values = {
  name: "foo",
  description: "A foo.",
};
      `,
    },
    {
      code: `
type Keys = "name" | "description";
type Values<K extends string> = Record<K, string>;
type Options<K extends string> = Values<K>;

const values: Options<Keys> = {
  name: "foo",
  description: "A foo.",
};
      `,
    },
    {
      code: `
type Keys = "name" | "description";
type Values = { [Key in Keys]?: string };

const values: Values = {
  name: "foo",
  description: "A foo.",
};
      `,
    },
    {
      code: `
type Keys = "name" | "description";

declare function logValues(values: Record<Keys, string>): void;

logValues({
  name: "foo",
  description: "A foo.",
});
      `,
    },
    {
      code: `
type Keys = "name" | "description";

declare function logValues<T extends Record<Keys, string>>(values: T): void;

logValues({
  name: "foo",
  description: "A foo.",
});
      `,
    },
    {
      code: `
type Keys = "name" | "description" | "name";

const values: Record<Keys, string> = {
  name: "foo",
  description: "A foo.",
};
      `,
    },
    {
      code: `
type FirstKeys = "name" | "description";
type SecondKeys = "description" | "name";

const first: Record<FirstKeys, string> = {
  name: "foo",
  description: "A foo.",
};
const second: Record<SecondKeys, string> = {
  description: "A foo.",
  name: "foo",
};
      `,
    },
    {
      code: `
type FirstKeys = "name" | "description";
type Keys = FirstKeys | "value";

const values: Record<Keys, string> = {
  description: "A foo.",
  name: "foo",
  value: "foo",
};
      `,
    },
    {
      code: `
type Keys = "name" | "description";
type Values = { [Key in Keys as Key]: string };

const values: Values = {
  description: "A foo.",
  name: "foo",
};
      `,
    },
    {
      code: `
type FirstKeys = "name" | "description";
type SecondKeys = "description" | "name";

const values: Record<FirstKeys, string> | Record<SecondKeys, string> = {
  description: "A foo.",
  name: "foo",
};
      `,
    },
    {
      code: `
type FirstKeys = "name";
type SecondKeys = "description";

const values: Record<FirstKeys, string> & Record<SecondKeys, string> = {
  description: "A foo.",
  name: "foo",
};
      `,
    },
    {
      code: `
interface Foo {
  name: string;
  description: string;
}

const foo: Foo = {
  name: "foo",
  description: "A foo.",
};
      `,
    },
    {
      code: `
interface Foo {
  name: string;
  description: string;
}

logFoo({
  name: "foo",
  description: "A foo.",
});

declare function logFoo(foo: Foo): void;
      `,
    },
    {
      code: `
interface Foo {
  nested: {
    name: string;
    description: string;
  };
}

const foo: Foo = {
  nested: {
    name: "foo",
    description: "A foo.",
  },
};
      `,
    },
    {
      code: `
interface List {
  kind: string;
  numLeadingSpaces: number;
  markerSize: number;
}

function getList(): List | undefined {
  return {
    kind: "Hyphen",
    numLeadingSpaces: 0,
    markerSize: 2,
  };
}
      `,
    },
    {
      code: `
type ReaddirOptions = {
  encoding?: string;
} & {
  withFileTypes: true;
  recursive?: boolean;
};

declare function readdir(options: ReaddirOptions): void;

readdir({
  withFileTypes: true,
  recursive: true,
});
      `,
    },
    {
      code: `
type SidebarItemDoc = {
  type: "doc" | "ref";
  label?: string;
  id: string;
};

type SidebarItemCategory = {
  type: "category";
  label: string;
  items: SidebarItemConfig[];
  link?: unknown;
};

type SidebarItemConfig = SidebarItemDoc | SidebarItemCategory | string;

const sidebar: SidebarItemConfig = {
  type: "category",
  label: "complete-common",
  items: [],
  link: {},
};
      `,
    },
    {
      code: `
interface PresenterOptions {
  schema: string;
  indent?: number;
  lineWidth?: number;
  quoteStyle?: "auto" | "single" | "double";
}

interface DumpOptions extends Omit<PresenterOptions, "schema"> {
  schema?: string;
  skipInvalid?: boolean;
}

declare function dump(options?: DumpOptions): void;

dump({
  lineWidth: -1,
  quoteStyle: "double",
});
      `,
    },
    {
      code: `
interface EnvironmentBase {
  type: string;
  applications: readonly string[];
}

interface ProdEnvironment extends EnvironmentBase {
  type: "prod";
}

interface StagingEnvironment extends EnvironmentBase {
  type: "staging";
}

interface DevEnvironment extends EnvironmentBase {
  type: "dev";
  branchUsername?: string;
}

type Environment = ProdEnvironment | StagingEnvironment | DevEnvironment;

const prod: Environment = {
  type: "prod",
  applications: [],
};
      `,
    },
    {
      code: `
interface BaseOptions {
  method?: string;
  signal?: string;
  body?: unknown;
}

interface RequestOptions extends Omit<BaseOptions, "body"> {
  body?: string;
}

declare function request(options: RequestOptions): void;

request({
  body: "payload",
  method: "POST",
  signal: "abort",
});
      `,
    },
    {
      code: `
interface Base {
  zebra?: string;
  alpha?: string;
  removed?: string;
}

type Wrapped = Readonly<Partial<Omit<Base, "removed">>>;

interface Options extends Wrapped {
  own?: string;
}

const options: Options = {
  own: "own",
  zebra: "zebra",
  alpha: "alpha",
};
      `,
    },
    {
      code: `
interface Base {
  zebra: string;
  alpha: string;
}

interface Options extends Base {
  own: string;
}

type Wrapped = Partial<Options>;

const options: Wrapped = {
  own: "own",
  zebra: "zebra",
  alpha: "alpha",
};
      `,
    },
    {
      code: `
interface Base<T> {
  zebra: T;
  overridden: string;
  alpha: T;
}

interface Middle<T> extends Base<T> {
  middle: T;
}

interface Options extends Middle<number> {
  own: number;
  overridden: "value";
}

const options: Options = {
  own: 1,
  overridden: "value",
  middle: 2,
  zebra: 3,
  alpha: 4,
};
      `,
    },
    {
      code: `
interface First {
  zebra: string;
}

interface Second {
  alpha: string;
}

interface Options extends First, Second {
  middle: string;
}

const options: Options = {
  alpha: "alpha",
  middle: "middle",
  zebra: "zebra",
};
      `,
    },
    {
      code: `
interface Base {
  alpha: string;
}

interface Options extends Base {
  zebra: string;
}

type Remapped = { [Key in keyof Options as Key]: Options[Key] };

const options: Remapped = {
  alpha: "alpha",
  zebra: "zebra",
};
      `,
    },
    {
      code: `
interface Options {
  signal?: string;
  method?: string;
}

interface Options {
  body?: string;
}

const options: Options = {
  body: "payload",
  method: "POST",
  signal: "abort",
};
      `,
    },
    {
      code: `
type Options = { signal?: string } & { method?: string; body?: string };

const options: Options = {
  body: "payload",
  method: "POST",
  signal: "abort",
};
      `,
    },
  ],

  invalid: [
    {
      code: `
interface RequiredOptions {
  plugins: string[];
  experimentalOperatorPosition: "start" | "end";
}

interface Options extends Partial<RequiredOptions> {}

interface Config extends Options {
  overrides?: string[];
}

const config: Config = {
  experimentalOperatorPosition: "start",
  overrides: [],
  plugins: [],
};
      `,
      output: `
interface RequiredOptions {
  plugins: string[];
  experimentalOperatorPosition: "start" | "end";
}

interface Options extends Partial<RequiredOptions> {}

interface Config extends Options {
  overrides?: string[];
}

const config: Config = {
  overrides: [],
  plugins: [],
  experimentalOperatorPosition: "start",
};
      `,
      errors: [
        {
          messageId: "incorrectDeclaredTypeOrder",
          data: {
            earlierName: "overrides",
            laterName: "experimentalOperatorPosition",
          },
        },
      ],
    },
    {
      code: `
type ParentConfig = "eslint/recommended" | "@typescript-eslint/recommended";

const links = {
  "@typescript-eslint/recommended": "typescript-eslint",
  "eslint/recommended": "eslint",
} as const satisfies Record<ParentConfig, string>;
      `,
      output: `
type ParentConfig = "eslint/recommended" | "@typescript-eslint/recommended";

const links = {
  "eslint/recommended": "eslint",
  "@typescript-eslint/recommended": "typescript-eslint",
} as const satisfies Record<ParentConfig, string>;
      `,
      errors: [
        {
          messageId: "incorrectDeclaredTypeOrder",
          data: {
            earlierName: "eslint/recommended",
            laterName: "@typescript-eslint/recommended",
          },
        },
      ],
    },
    {
      code: `
type Keys = "name" | "description";

const values: Record<Keys, string> = {
  description: "A foo.",
  name: "foo",
};
      `,
      output: `
type Keys = "name" | "description";

const values: Record<Keys, string> = {
  name: "foo",
  description: "A foo.",
};
      `,
      errors: [
        {
          messageId: "incorrectDeclaredTypeOrder",
          data: {
            earlierName: "name",
            laterName: "description",
          },
        },
      ],
    },
    {
      code: `
const foo = {
  name: "foo",
  description: "A foo.",
};
      `,
      output: `
const foo = {
  description: "A foo.",
  name: "foo",
};
      `,
      errors: [
        {
          messageId: "incorrectAlphabeticalOrder",
          data: {
            earlierName: "description",
            laterName: "name",
          },
        },
      ],
    },
    {
      code: `
declare function getValue<T>(callback: () => T): T;

const value = getValue(() => ({
  b: 1,
  a: 2,
}));
      `,
      output: `
declare function getValue<T>(callback: () => T): T;

const value = getValue(() => ({
  a: 2,
  b: 1,
}));
      `,
      errors: [
        {
          messageId: "incorrectAlphabeticalOrder",
          data: {
            earlierName: "a",
            laterName: "b",
          },
        },
      ],
    },
    {
      code: `
const foo: Record<string, unknown> = {
  name: "foo",
  description: "A foo.",
};
      `,
      output: `
const foo: Record<string, unknown> = {
  description: "A foo.",
  name: "foo",
};
      `,
      errors: [
        {
          messageId: "incorrectAlphabeticalOrder",
          data: {
            earlierName: "description",
            laterName: "name",
          },
        },
      ],
    },
    {
      code: `
interface List {
  kind: string;
  numLeadingSpaces: number;
  markerSize: number;
}

function getList(): List | undefined {
  return {
    kind: "Hyphen",
    markerSize: 2,
    numLeadingSpaces: 0,
  };
}
      `,
      output: `
interface List {
  kind: string;
  numLeadingSpaces: number;
  markerSize: number;
}

function getList(): List | undefined {
  return {
    kind: "Hyphen",
    numLeadingSpaces: 0,
    markerSize: 2,
  };
}
      `,
      errors: [
        {
          messageId: "incorrectDeclaredTypeOrder",
          data: {
            earlierName: "numLeadingSpaces",
            laterName: "markerSize",
          },
        },
      ],
    },
    {
      code: `
type ReaddirOptions = {
  encoding?: string;
} & {
  withFileTypes: true;
  recursive?: boolean;
};

declare function readdir(options: ReaddirOptions): void;

readdir({
  recursive: true,
  withFileTypes: true,
});
      `,
      output: `
type ReaddirOptions = {
  encoding?: string;
} & {
  withFileTypes: true;
  recursive?: boolean;
};

declare function readdir(options: ReaddirOptions): void;

readdir({
  withFileTypes: true,
  recursive: true,
});
      `,
      errors: [
        {
          messageId: "incorrectDeclaredTypeOrder",
          data: {
            earlierName: "withFileTypes",
            laterName: "recursive",
          },
        },
      ],
    },
    {
      code: `
type SidebarItemDoc = {
  type: "doc" | "ref";
  label?: string;
  id: string;
};

type SidebarItemCategory = {
  type: "category";
  label: string;
  items: SidebarItemConfig[];
  link?: unknown;
};

type SidebarItemConfig = SidebarItemDoc | SidebarItemCategory | string;

const sidebar: SidebarItemConfig = {
  label: "complete-common",
  type: "category",
  items: [],
  link: {},
};
      `,
      output: `
type SidebarItemDoc = {
  type: "doc" | "ref";
  label?: string;
  id: string;
};

type SidebarItemCategory = {
  type: "category";
  label: string;
  items: SidebarItemConfig[];
  link?: unknown;
};

type SidebarItemConfig = SidebarItemDoc | SidebarItemCategory | string;

const sidebar: SidebarItemConfig = {
  type: "category",
  label: "complete-common",
  items: [],
  link: {},
};
      `,
      errors: [
        {
          messageId: "incorrectDeclaredTypeOrder",
          data: {
            earlierName: "type",
            laterName: "label",
          },
        },
      ],
    },
    {
      code: `
interface PresenterOptions {
  schema: string;
  indent?: number;
  lineWidth?: number;
  quoteStyle?: "auto" | "single" | "double";
}

interface DumpOptions extends Omit<PresenterOptions, "schema"> {
  schema?: string;
  skipInvalid?: boolean;
}

declare function dump(options?: DumpOptions): void;

dump({
  quoteStyle: "double",
  lineWidth: -1,
});
      `,
      output: `
interface PresenterOptions {
  schema: string;
  indent?: number;
  lineWidth?: number;
  quoteStyle?: "auto" | "single" | "double";
}

interface DumpOptions extends Omit<PresenterOptions, "schema"> {
  schema?: string;
  skipInvalid?: boolean;
}

declare function dump(options?: DumpOptions): void;

dump({
  lineWidth: -1,
  quoteStyle: "double",
});
      `,
      errors: [
        {
          messageId: "incorrectDeclaredTypeOrder",
          data: {
            earlierName: "lineWidth",
            laterName: "quoteStyle",
          },
        },
      ],
    },
    {
      code: `
interface EnvironmentBase {
  type: string;
  applications: readonly string[];
}

interface ProdEnvironment extends EnvironmentBase {
  type: "prod";
}

interface StagingEnvironment extends EnvironmentBase {
  type: "staging";
}

interface DevEnvironment extends EnvironmentBase {
  type: "dev";
  branchUsername?: string;
}

type Environment = ProdEnvironment | StagingEnvironment | DevEnvironment;

const prod: Environment = {
  applications: [],
  type: "prod",
};
      `,
      output: `
interface EnvironmentBase {
  type: string;
  applications: readonly string[];
}

interface ProdEnvironment extends EnvironmentBase {
  type: "prod";
}

interface StagingEnvironment extends EnvironmentBase {
  type: "staging";
}

interface DevEnvironment extends EnvironmentBase {
  type: "dev";
  branchUsername?: string;
}

type Environment = ProdEnvironment | StagingEnvironment | DevEnvironment;

const prod: Environment = {
  type: "prod",
  applications: [],
};
      `,
      errors: [
        {
          messageId: "incorrectDeclaredTypeOrder",
          data: {
            earlierName: "type",
            laterName: "applications",
          },
        },
      ],
    },
    {
      code: `
interface BaseOptions {
  method?: string;
  signal?: string;
  body?: unknown;
}

interface RequestOptions extends Omit<BaseOptions, "body"> {
  body?: string;
}

declare function request(options: RequestOptions): void;

request({
  method: "POST",
  signal: "abort",
  body: "payload",
});
      `,
      output: `
interface BaseOptions {
  method?: string;
  signal?: string;
  body?: unknown;
}

interface RequestOptions extends Omit<BaseOptions, "body"> {
  body?: string;
}

declare function request(options: RequestOptions): void;

request({
  body: "payload",
  method: "POST",
  signal: "abort",
});
      `,
      errors: [
        {
          messageId: "incorrectDeclaredTypeOrder",
          data: {
            earlierName: "body",
            laterName: "signal",
          },
        },
      ],
    },
    {
      code: `
interface Options {
  signal?: string;
  method?: string;
}

interface Options {
  body?: string;
}

const options: Options = {
  signal: "abort",
  method: "POST",
  body: "payload",
};
      `,
      output: `
interface Options {
  signal?: string;
  method?: string;
}

interface Options {
  body?: string;
}

const options: Options = {
  body: "payload",
  method: "POST",
  signal: "abort",
};
      `,
      errors: [
        {
          messageId: "incorrectAlphabeticalOrder",
          data: {
            earlierName: "method",
            laterName: "signal",
          },
        },
      ],
    },
    {
      code: `
type Options = { signal?: string } & { method?: string; body?: string };

const options: Options = {
  signal: "abort",
  method: "POST",
  body: "payload",
};
      `,
      output: `
type Options = { signal?: string } & { method?: string; body?: string };

const options: Options = {
  body: "payload",
  method: "POST",
  signal: "abort",
};
      `,
      errors: [
        {
          messageId: "incorrectAlphabeticalOrder",
          data: {
            earlierName: "method",
            laterName: "signal",
          },
        },
      ],
    },
    {
      code: `
interface Foo {
  name: string;
  description: string;
}

const foo: Foo = { description: "A foo.", name: "foo" };
      `,
      output: `
interface Foo {
  name: string;
  description: string;
}

const foo: Foo = { name: "foo", description: "A foo." };
      `,
      errors: [
        {
          messageId: "incorrectDeclaredTypeOrder",
          data: {
            earlierName: "name",
            laterName: "description",
          },
        },
      ],
    },
    {
      code: `
interface Foo {
  name: string;
  description: string;
}

const foo: Foo = {
  description: "A foo.",
  name: "foo",
};
      `,
      output: `
interface Foo {
  name: string;
  description: string;
}

const foo: Foo = {
  name: "foo",
  description: "A foo.",
};
      `,
      errors: [
        {
          messageId: "incorrectDeclaredTypeOrder",
          data: {
            earlierName: "name",
            laterName: "description",
          },
        },
      ],
    },
    {
      code: `
interface Foo {
  name: string;
  description: string;
}

logFoo({
  description: "A foo.",
  name: "foo",
});

declare function logFoo(foo: Foo): void;
      `,
      output: `
interface Foo {
  name: string;
  description: string;
}

logFoo({
  name: "foo",
  description: "A foo.",
});

declare function logFoo(foo: Foo): void;
      `,
      errors: [
        {
          messageId: "incorrectDeclaredTypeOrder",
          data: {
            earlierName: "name",
            laterName: "description",
          },
        },
      ],
    },
    {
      code: `
interface Options {
  stdout: string;
  stderr: string;
}

declare function bind<T extends Options>(options: T): void;

bind({
  stderr: "inherit",
  stdout: "inherit",
});
      `,
      output: `
interface Options {
  stdout: string;
  stderr: string;
}

declare function bind<T extends Options>(options: T): void;

bind({
  stdout: "inherit",
  stderr: "inherit",
});
      `,
      errors: [
        {
          messageId: "incorrectDeclaredTypeOrder",
          data: {
            earlierName: "stdout",
            laterName: "stderr",
          },
        },
      ],
    },
    {
      code: `
interface Foo {
  nested: {
    name: string;
    description: string;
  };
}

const foo: Foo = {
  nested: {
    description: "A foo.",
    name: "foo",
  },
};
      `,
      output: `
interface Foo {
  nested: {
    name: string;
    description: string;
  };
}

const foo: Foo = {
  nested: {
    name: "foo",
    description: "A foo.",
  },
};
      `,
      errors: [
        {
          messageId: "incorrectDeclaredTypeOrder",
          data: {
            earlierName: "name",
            laterName: "description",
          },
        },
      ],
    },
  ],
});

function createInheritanceProgram(
  reverseFiles: boolean,
  reverseTypes: boolean,
): ts.Program {
  const basePath = path.join(__dirname, "../fixtures/sort-objects-base.ts");
  const derivedPath = path.join(
    __dirname,
    "../fixtures/sort-objects-derived.ts",
  );
  const files = new Map([
    [
      basePath,
      `
export interface RequiredOptions {
  plugins: string[];
  experimentalOperatorPosition: "start" | "end";
}
`,
    ],
    [
      derivedPath,
      `
import type { RequiredOptions } from "./sort-objects-base";

export interface Options extends Partial<RequiredOptions> {}

export interface Config extends Options {
  overrides?: string[];
}
`,
    ],
    [INHERITANCE_FILE_PATH, INHERITANCE_CODE],
  ]);
  const options: ts.CompilerOptions = {
    module: ts.ModuleKind.CommonJS,
    strict: true,
    target: ts.ScriptTarget.ESNext,
  };
  const host = ts.createCompilerHost(options);
  const fileExists = host.fileExists.bind(host);
  const getSourceFile = host.getSourceFile.bind(host);
  const readFile = host.readFile.bind(host);
  host.fileExists = (fileName) => files.has(fileName) || fileExists(fileName);
  host.readFile = (fileName) => files.get(fileName) ?? readFile(fileName);
  host.getSourceFile = (fileName, languageVersion, onError, shouldCreate) => {
    const code = files.get(fileName);
    return code === undefined
      ? getSourceFile(fileName, languageVersion, onError, shouldCreate)
      : ts.createSourceFile(fileName, code, languageVersion);
  };

  const rootNames = files.keys().toArray();
  if (reverseFiles) {
    rootNames.reverse();
  }

  const program = ts.createProgram(rootNames, options, host);
  const checker = program.getTypeChecker();
  const typeOrder = reverseTypes ? rootNames.toReversed() : rootNames;
  for (const fileName of typeOrder) {
    const source = program.getSourceFile(fileName);
    if (source === undefined) {
      throw new Error(`Missing test source: ${fileName}`);
    }

    for (const statement of source.statements) {
      if (ts.isInterfaceDeclaration(statement)) {
        checker.getTypeAtLocation(statement).getProperties();
      }
    }
  }

  return program;
}
